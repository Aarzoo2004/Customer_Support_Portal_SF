import { LightningElement, wire } from 'lwc';
import getUserCases from '@salesforce/apex/CustomerPortalCaseController.getUserCases';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

export default class CustomerCaseList extends NavigationMixin(LightningElement) {
    cases;
    error;
    isLoading = true;
    wiredCasesResult; // Store the wired result for refresh

    @wire(getUserCases)
    wiredCases(result) {
        this.wiredCasesResult = result; // Store for refresh
        this.isLoading = false;
        
        if (result.data) {
            // Format the dates for display
            this.cases = result.data.map(caseRecord => {
                return {
                    ...caseRecord,
                    formattedDate: new Date(caseRecord.CreatedDate).toLocaleDateString()
                };
            });
            this.error = undefined;
        } else if (result.error) {
            this.error = 'Error loading cases: ' + result.error.body.message;
            this.cases = undefined;
        }
    }

    get hasCases() {
        return this.cases && this.cases.length > 0;
    }

    handleViewCase(event) {
        const caseId = event.target.dataset.id;
        
        // Navigate to case detail page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: caseId,
                objectApiName: 'Case',
                actionName: 'view'
            }
        });
    }

    // Listen for custom event from create case form
    connectedCallback() {
        // Add event listener for case created
        window.addEventListener('casecreated', this.handleCaseCreated.bind(this));
    }

    disconnectedCallback() {
        // Remove event listener
        window.removeEventListener('casecreated', this.handleCaseCreated.bind(this));
    }

    handleCaseCreated() {
        // Refresh the case list
        this.isLoading = true;
        return refreshApex(this.wiredCasesResult);
    }

    // Add a manual refresh button handler (optional but useful)
    handleRefresh() {
        this.isLoading = true;
        return refreshApex(this.wiredCasesResult);
    }
}