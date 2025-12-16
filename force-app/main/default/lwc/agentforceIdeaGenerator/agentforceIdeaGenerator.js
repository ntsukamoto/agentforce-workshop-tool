import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAgents from '@salesforce/apex/AgentWorkshopController.getAgents';
import { refreshApex } from '@salesforce/apex';

export default class AgentforceIdeaGenerator extends LightningElement {
    agents;
    wiredAgentsResult;
    isModalOpen = false;
    selectedRecordId;

    modalStyles = 'display: none;';

    @wire(getAgents)
    wiredAgents(response) {
        this.wiredAgentsResult = response;
        const { data, error } = response;
        if (data) {
            this.agents = data;
        } else if (error) {
            // Basic error surface via toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'データ取得エラー',
                    message: this._normalizeError(error),
                    variant: 'error'
                })
            );
        }
    }

    openModal(event) {
        const recordId = event.currentTarget.dataset.recordId;
        this.selectedRecordId = recordId;
        this.isModalOpen = true;
        this.modalStyles = '';
    }

    closeModal() {
        this.isModalOpen = false;
        this.modalStyles = 'display: none;';
        this.selectedRecordId = null;
    }

    handleSuccess() {
        // 1) Show success toast
        this.dispatchEvent(
            new ShowToastEvent({
                title: '保存しました',
                message: 'アイデアが正常に保存されました。',
                variant: 'success'
            })
        );

        // 2) Reset input fields in the lightning-record-edit-form
        const form = this.template.querySelector('lightning-record-edit-form');
        if (form) {
            const inputs = form.querySelectorAll('lightning-input-field');
            inputs.forEach((input) => {
                if (typeof input.reset === 'function') {
                    input.reset();
                }
            });
        }

        // 3) Refresh the wired list immediately
        if (this.wiredAgentsResult) {
            refreshApex(this.wiredAgentsResult);
        }
    }

    handleModalSuccess() {
        // 1) Show success toast
        this.dispatchEvent(
            new ShowToastEvent({
                title: '保存しました',
                message: '評価が正常に保存されました。',
                variant: 'success'
            })
        );

        // 2) Close modal
        this.closeModal();

        // 3) Refresh the wired list immediately to show updated data
        if (this.wiredAgentsResult) {
            refreshApex(this.wiredAgentsResult);
        }
    }

    handleError(event) {
        const msg = event?.detail?.message || '保存に失敗しました。入力内容をご確認ください。';
       this.dispatchEvent(
            new ShowToastEvent({
                title: 'エラー',
                message: msg,
                variant: 'error'
            })
        );
    }

    _normalizeError(error) {
        // Utility to extract a readable error message
        if (!error) return '不明なエラーが発生しました';
        if (Array.isArray(error.body)) {
            return error.body.map((e) => e.message).join(', ');
        } else if (error.body && typeof error.body.message === 'string') {
            return error.body.message;
        }
        return typeof error.message === 'string' ? error.message : '不明なエラーが発生しました';
    }
}