import { LightningElement, wire, track } from 'lwc';
import getUserCases from '@salesforce/apex/CustomerPortalCaseController.getUserCases';
import { refreshApex } from '@salesforce/apex';

export default class CaseDashboard extends LightningElement {
    @track cases = [];
    @track error;
    @track isLoading = true;
    wiredCasesResult;

    // Statistics
    totalCases = 0;
    openCases = 0;
    inProgressCases = 0;
    resolvedCases = 0;
    highPriorityCases = 0;
    mediumPriorityCases = 0;
    lowPriorityCases = 0;

    @wire(getUserCases)
    wiredCases(result) {
        this.wiredCasesResult = result;
        this.isLoading = false;

        if (result.data) {
            this.cases = result.data;
            this.calculateStatistics();
            this.error = undefined;
        } else if (result.error) {
            this.error = 'Error loading dashboard data';
            this.cases = [];
        }
    }

    calculateStatistics() {
        // Reset counters
        this.totalCases = this.cases.length;
        this.openCases = 0;
        this.inProgressCases = 0;
        this.resolvedCases = 0;
        this.highPriorityCases = 0;
        this.mediumPriorityCases = 0;
        this.lowPriorityCases = 0;

        // Count cases by status and priority
        this.cases.forEach(caseRecord => {
            // Count by status
            if (caseRecord.Status === 'New') {
                this.openCases++;
            } else if (caseRecord.Status === 'Working' || caseRecord.Status === 'Escalated') {
                this.inProgressCases++;
            } else if (caseRecord.Status === 'Closed') {
                this.resolvedCases++;
            } else {
                // For any other status, count as in progress
                this.inProgressCases++;
            }

            // Count by priority
            if (caseRecord.Priority === 'High') {
                this.highPriorityCases++;
            } else if (caseRecord.Priority === 'Medium') {
                this.mediumPriorityCases++;
            } else if (caseRecord.Priority === 'Low') {
                this.lowPriorityCases++;
            }
        });
    }

    // Calculate priority bar widths
    get highPriorityWidth() {
        if (this.totalCases === 0) return 'width: 0%';
        const percentage = (this.highPriorityCases / this.totalCases) * 100;
        return `width: ${percentage}%`;
    }

    get mediumPriorityWidth() {
        if (this.totalCases === 0) return 'width: 0%';
        const percentage = (this.mediumPriorityCases / this.totalCases) * 100;
        return `width: ${percentage}%`;
    }

    get lowPriorityWidth() {
        if (this.totalCases === 0) return 'width: 0%';
        const percentage = (this.lowPriorityCases / this.totalCases) * 100;
        return `width: ${percentage}%`;
    }

    // Recent cases (last 5)
    get recentCases() {
        return this.cases.slice(0, 5).map(caseRecord => {
            return {
                ...caseRecord,
                formattedDate: this.formatDate(caseRecord.CreatedDate)
            };
        });
    }

    get hasRecentCases() {
        return this.recentCases && this.recentCases.length > 0;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Refresh handler
    handleRefresh() {
        this.isLoading = true;
        return refreshApex(this.wiredCasesResult);
    }

    // Listen for case created event
    connectedCallback() {
        window.addEventListener('casecreated', this.handleCaseCreated.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('casecreated', this.handleCaseCreated.bind(this));
    }

    handleCaseCreated() {
        this.handleRefresh();
    }
}