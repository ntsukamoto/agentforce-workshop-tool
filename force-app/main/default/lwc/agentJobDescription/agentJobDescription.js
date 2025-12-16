import { LightningElement, api, track } from 'lwc';
import getJobDescription from '@salesforce/apex/AgentJobDescriptionController.getJobDescription';
import getAgentContext from '@salesforce/apex/AgentJobDescriptionController.getAgentContext';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AgentJobDescription extends LightningElement {
    // Tab control
    activeTabValue = 'create';

    // Agent selected context (Tab1)
    @api selectedAgentId;
    @track selectedAgentContext = {};
    @track isSaveDisabled = true;

    // View tab state (Tab2)
    @track selectedJdId;
    @track isDataLoaded = false;
    @track job = {};

    // Tab activation: refresh data for the active tab
    async handleTabActive(event) {
        this.activeTabValue = event.target.value;
        // No need to load agents or job list anymore since we're using lookup
    }

    async handleAgentSelect(event) {
        // Check if event contains recordId (selection) or is empty (clear)
        if (event.detail && event.detail.recordId) {
            this.selectedAgentId = event.detail.recordId;
            // Enable save only when agent selected
            this.isSaveDisabled = false;
            // Fetch agent context
            await this.fetchAgentContext(this.selectedAgentId);
        } else {
            // Clear selection
            this.selectedAgentId = undefined;
            this.isSaveDisabled = true;
            // Clear previous context
            this.selectedAgentContext = {};
        }
    }

    async fetchAgentContext(agentId) {
        try {
            const context = await getAgentContext({ agentId: agentId });
            this.selectedAgentContext = context || {};
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error fetching agent context:', e);
            this.selectedAgentContext = {};
        }
    }


    // Create tab: on save show toast and reset without switching tabs
    handleCreateSuccess(event) {
        const evt = new ShowToastEvent({
            title: '保存しました',
            message: `求人票（ID: ${event.detail.id}）を保存しました。`,
            variant: 'success'
        });
        this.dispatchEvent(evt);
        // reset form for next entry
        this.resetForm();
    }

    // View tab: selection change -> fetch details
    handleJobSelect(event) {
        console.log('handleJobSelect called with:', event.detail);
        this.selectedJdId = event.detail.recordId;
        this.isDataLoaded = false;
        this.job = {};
        if (!this.selectedJdId) {
            console.log('No job ID selected');
            return;
        }
        console.log('Fetching job details for ID:', this.selectedJdId);
        // Fetch job details
        this.fetchJobDetails(this.selectedJdId);
    }

    async fetchJobDetails(jobId) {
        console.log('fetchJobDetails called with:', jobId);
        try {
            const dto = await getJobDescription({ jobId: jobId });
            console.log('Received DTO:', dto);
            this.job = dto || {};
            this.isDataLoaded = true;
            console.log('isDataLoaded set to true');
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error fetching job details:', e);
            this.isDataLoaded = false;
        }
    }

    // Reset inputs in the create form to allow continuous creation
    resetForm() {
        // clear LDS form fields
        const form = this.template.querySelector('lightning-record-edit-form');
        if (form) {
            // Standard way: re-render by toggling key
            // Or manually reset child input fields
            const inputs = form.querySelectorAll('lightning-input-field');
            inputs.forEach((i) => {
                // eslint-disable-next-line no-unused-expressions
                i.reset && i.reset();
            });
        }
        // keep selected agent; user can keep creating for same agent
    }

    // Keep previous error handler
    handleError(event) {
        // eslint-disable-next-line no-console
        console.error(event.detail);
        const evt = new ShowToastEvent({
            title: '保存に失敗しました',
            message: (event && event.detail && event.detail.message) || '不明なエラー',
            variant: 'error'
        });
        this.dispatchEvent(evt);
    }
}
