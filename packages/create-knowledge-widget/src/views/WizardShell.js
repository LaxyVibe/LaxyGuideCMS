import { BasicInformation } from './steps/BasicInformation';
import { UploadMaterials } from './steps/UploadMaterials';
import { AiProcessing } from './steps/AiProcessing';
import { VerifyKnowledge } from './steps/VerifyKnowledge';
import React from 'react';

const h = React.createElement;

export function WizardShell({ ctrl, state }) {
    // Collapsed view when dialog is not shown
    if (!state.showDialog) {
        const summary = state.kbName ? state.kbName : 'No knowledge base set';
        return h('div', null, [
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
                h('div', {
                    style: { fontSize: '12px', color: '#4b5563', flexGrow: 1 }
                }, summary),
                h('button', {
                    type: 'button',
                    style: {
                        padding: '6px 12px',
                        background: '#111827',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px'
                    },
                    onClick: () => ctrl.openDialog()
                }, state.kbName ? 'Edit Knowledge' : 'Create Knowledge')
            ])
        ]);
    }

    // Dialog overlay and container styles
    const overlayStyle = {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto'
    };

    const dialogStyle = {
        background: '#fff',
        padding: '24px',
        width: '100%',
        maxWidth: '1100px',
        borderRadius: '6px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
        fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
    };

    const contentWrapStyle = {
        overflowY: 'auto',
        paddingRight: '4px'
    };

    // Step labels for the 4-step workflow
    const steps = ['Basic Information', 'Upload Materials', 'AI Processing', 'Verify Knowledge'];

    // Steps indicator bar
    const stepsBar = h('div', {
        style: { display: 'flex', gap: '28px', marginBottom: '24px' }
    }, steps.map((label, i) => h('div', {
        key: label,
        style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: state.step === i + 1 ? '600' : '500',
            color: state.step === i + 1 ? '#111827' : '#6b7280'
        }
    }, [
        h('div', {
            style: {
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: state.step === i + 1 ? '#111827' : '#e5e7eb',
                color: state.step === i + 1 ? '#fff' : '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                marginBottom: '6px',
                fontWeight: '600'
            }
        }, String(i + 1)),
        h('span', null, label)
    ])));

    // Render appropriate step component based on current step
    let body = null;
    if (state.step === 1) body = BasicInformation({ state, ctrl });
    else if (state.step === 2) body = UploadMaterials({ state, ctrl });
    else if (state.step === 3) body = AiProcessing({ state, ctrl });
    else if (state.step === 4) body = VerifyKnowledge({ state, ctrl });

    // Navigation buttons
    const navRow = h('div', {
        style: { display: 'flex', justifyContent: 'space-between', marginTop: '24px' }
    }, [
        h('div', null,
            state.step > 1 ? h('button', {
                type: 'button',
                style: {
                    padding: '8px 18px',
                    background: '#e5e7eb',
                    color: '#111827',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                },
                onClick: () => ctrl.prev()
            }, 'Previous') : null
        ),
        h('div', { style: { display: 'flex', gap: '8px' } }, [
            h('button', {
                type: 'button',
                style: {
                    padding: '8px 18px',
                    background: '#e5e7eb',
                    color: '#111827',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                },
                onClick: () => ctrl.closeDialog()
            }, 'Cancel'),
            state.step === 4 ? h('button', {
                type: 'button',
                style: {
                    padding: '8px 18px',
                    background: '#111827',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                },
                onClick: () => { ctrl.persist(); ctrl.closeDialog(); }
            }, 'Save & Complete') : h('button', {
                type: 'button',
                style: {
                    padding: '8px 18px',
                    background: '#111827',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                },
                onClick: () => ctrl.next()
            }, 'Next')
        ])
    ]);

    return h('div', { style: overlayStyle },
        h('div', { style: dialogStyle }, [
            h('h2', { style: { margin: '0 0 4px', fontSize: '18px' } }, 'Create Knowledge'),
            h('div', {
                style: { marginBottom: '24px', fontSize: '12px', color: '#6b7280' }
            }, 'Build and manage your knowledge base with AI assistance'),
            stepsBar,
            h('div', { style: contentWrapStyle }, [body]),
            navRow
        ])
    );
}
