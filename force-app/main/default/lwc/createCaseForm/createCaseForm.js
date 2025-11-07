import { LightningElement, track } from 'lwc';
import createCase from '@salesforce/apex/CustomerPortalCaseController.createCase';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateCaseForm extends LightningElement {
    @track subject = '';
    @track description = '';
    @track priority = 'Medium';
    @track error;
    @track showSuccess = false;
    @track newCaseNumber = '';
    @track isSubmitting = false;

    // Priority dropdown options
    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' }
    ];

    // Show priority help text
    get showPriorityHelp() {
        return this.priority !== '';
    }

    // Handle field changes
    handleSubjectChange(event) {
        this.subject = event.target.value;
        this.error = undefined;
        this.showSuccess = false;
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
        this.error = undefined;
        this.showSuccess = false;
    }

    handlePriorityChange(event) {
        this.priority = event.target.value;
        this.error = undefined;
        this.showSuccess = false;
    }

    // Validate form
    validateForm() {
        const allValid = [
            ...this.template.querySelectorAll('lightning-input'),
            ...this.template.querySelectorAll('lightning-textarea'),
            ...this.template.querySelectorAll('lightning-combobox')
        ].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);

        if (!allValid) {
            this.error = 'Please fill in all required fields.';
            return false;
        }

        if (this.subject.trim().length < 5) {
            this.error = 'Subject must be at least 5 characters long.';
            return false;
        }

        if (this.description.trim().length < 10) {
            this.error = 'Description must be at least 10 characters long.';
            return false;
        }

        return true;
    }

    // Submit case
    handleSubmit() {
        // Reset messages
        this.error = undefined;
        this.showSuccess = false;

        // Validate form
        if (!this.validateForm()) {
            return;
        }

        // Show loading spinner
        this.isSubmitting = true;

        // Call Apex to create case
        createCase({
            subject: this.subject.trim(),
            description: this.description.trim(),
            priority: this.priority
        })
        .then(result => {
    // Success!
    this.showSuccess = true;
    this.newCaseNumber = 'Your case has been created';
    
    // Show toast notification
    this.dispatchEvent(
        new ShowToastEvent({
            title: 'Success',
            message: 'Case submitted successfully!',
            variant: 'success'
        })
    );

    // Fire event to tell other components to refresh
    window.dispatchEvent(new CustomEvent('casecreated'));

    // Also dispatch component event
    this.dispatchEvent(new CustomEvent('casecreated'));

    // Clear form after 2 seconds
    setTimeout(() => {
        this.handleClear();
    }, 2000);
})
        .catch(error => {
            // Handle error
            this.error = error.body ? error.body.message : 'Unknown error occurred';
            
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: this.error,
                    variant: 'error'
                })
            );
        })
        .finally(() => {
            this.isSubmitting = false;
        });
    }

    // Clear form
    handleClear() {
        this.subject = '';
        this.description = '';
        this.priority = 'Medium';
        this.error = undefined;
        this.showSuccess = false;
        this.newCaseNumber = '';

        // Reset all input fields
        const inputFields = this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-combobox');
        if (inputFields) {
            inputFields.forEach(field => {
                field.value = '';
            });
        }
    }
}