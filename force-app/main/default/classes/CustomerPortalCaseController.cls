public with sharing class CustomerPortalCaseController {
    
   /**
 * Get all cases for the current logged-in user
 * Returns cases ordered by most recent first
 */
@AuraEnabled(cacheable=true)
public static List<Case> getUserCases() {
    try {
        // Get current user's Contact Id (for portal users)
        User currentUser = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        
        List<Case> cases;
        
        if (currentUser.ContactId != null) {
            // Portal user - return cases linked to their contact
            cases = [
                SELECT Id, CaseNumber, Subject, Description, Status, 
                       Portal_Status__c, CreatedDate, LastModifiedDate,
                       Priority, Origin
                FROM Case 
                WHERE ContactId = :currentUser.ContactId
                ORDER BY CreatedDate DESC
                LIMIT 100
            ];
        } else {
            // Internal user testing - return recent cases without contact filter
            // In production, you might want to filter by OwnerId or other criteria
            cases = [
                SELECT Id, CaseNumber, Subject, Description, Status, 
                       Portal_Status__c, CreatedDate, LastModifiedDate,
                       Priority, Origin
                FROM Case 
                WHERE Origin = 'Web'
                ORDER BY CreatedDate DESC
                LIMIT 100
            ];
        }
        
        return cases;
        
    } catch (Exception e) {
        throw new AuraHandledException('Error fetching cases: ' + e.getMessage());
    }
}
   /**
 * Create a new case from the portal
 */
@AuraEnabled
public static String createCase(String subject, String description, String priority) {
    try {
        // Get current user's Contact Id
        User currentUser = [SELECT Id, ContactId, Contact.AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        
        // Create new case
        Case newCase = new Case();
        newCase.Subject = subject;
        newCase.Description = description;
        newCase.Priority = priority;
        newCase.Status = 'New';
        newCase.Portal_Status__c = 'New';
        newCase.Origin = 'Web';
        
        // If user has a contact (portal user), associate it
        if (currentUser.ContactId != null) {
            newCase.ContactId = currentUser.ContactId;
            newCase.AccountId = currentUser.Contact.AccountId;
        } else {
            // For internal users testing, create without contact
            // In production, you'd want to handle this differently
            System.debug('Warning: Creating case without contact association');
        }
        
        insert newCase;
        
        // Query the case to get the CaseNumber
        Case insertedCase = [SELECT Id, CaseNumber FROM Case WHERE Id = :newCase.Id LIMIT 1];
        
        return insertedCase.Id;
        
    } catch (Exception e) {
        System.debug('Error creating case: ' + e.getMessage());
        System.debug('Stack trace: ' + e.getStackTraceString());
        throw new AuraHandledException('Error creating case: ' + e.getMessage());
    }
}
    
    /**
     * Update Last Viewed Date when customer opens a case
     */
    @AuraEnabled
    public static void markCaseAsViewed(String caseId) {
        try {
            Case caseToUpdate = new Case(
                Id = caseId,
                Last_Viewed_Date__c = System.now()
            );
            
            update caseToUpdate;
            
        } catch (Exception e) {
            throw new AuraHandledException('Error updating case: ' + e.getMessage());
        }
    }
}