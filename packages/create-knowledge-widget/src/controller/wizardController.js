import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { initialState, hydrate, serialize, persistableKeys } from '../model/state';
import { WizardShell } from '../views/WizardShell';

// Inner Widget Component (Functional, uses Local React Hooks)
function KnowledgeBaseWizard(props) {
    // Initialize state from props.value
    const [state, setState] = useState(() => hydrate(props.value));

    // Ref to track if we are currently saving to avoid loops
    const isInternalUpdate = useRef(false);

    // Sync from props.value when it changes externally
    useEffect(() => {
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        const externalState = hydrate(props.value);
        setState(prev => ({
            ...externalState,
            // Preserve transient UI state
            showDialog: prev.showDialog,
            step: prev.step,
            error: prev.error,
            isSaving: prev.isSaving
        }));
    }, [props.value]);

    // Persist helper
    const persist = useCallback((newState) => {
        isInternalUpdate.current = true;
        props.onChange(serialize(newState));
    }, [props]);

    // Update state helper
    const updateState = useCallback((updates, shouldPersist = false) => {
        setState(prev => {
            const next = { ...prev, ...updates };
            if (shouldPersist) persist(next);
            return next;
        });
    }, [persist]);

    // Controller methods
    const ctrl = {
        setState: (updates) => updateState(updates),
        setField: (key, value) => updateState({ [key]: value }, true),
        persist: () => persist(state),
        openDialog: () => updateState({ showDialog: true }),
        closeDialog: () => updateState({ showDialog: false }),
        toggle: (key) => updateState({ [key]: !state[key] }, true),
        next: () => {
            const current = state.step || 1;
            const nextStep = Math.min(4, current + 1);
            updateState({ step: nextStep });
        },
        prev: () => updateState({ step: Math.max(1, (state.step || 1) - 1) })
    };

    return React.createElement(WizardShell, { ctrl, state });
}

// Factory function to create widget components using the CMS instance
export function createKnowledgeWidget(CMS) {
    const h = CMS?.h || (typeof window !== 'undefined' && window.h) || React.createElement;

    class Control extends React.Component {
        constructor(props) {
            super(props);
            this.mountRef = React.createRef();
            this.root = null;
        }

        componentDidMount() {
            if (this.mountRef.current) {
                this.root = ReactDOM.createRoot(this.mountRef.current);
                this.root.render(React.createElement(KnowledgeBaseWizard, this.props));
            }
        }

        componentDidUpdate() {
            if (this.root) {
                this.root.render(React.createElement(KnowledgeBaseWizard, this.props));
            }
        }

        componentWillUnmount() {
            if (this.root) {
                this.root.unmount();
            }
        }

        render() {
            return h('div', {
                className: 'laxy-create-knowledge-widget',
                ref: (el) => { this.mountRef.current = el; }
            });
        }
    }

    const Preview = (props) => {
        const raw = props.value || '';
        let out = {};
        try { out = JSON.parse(raw); } catch { out.data = raw; }
        return h('pre', {
            style: {
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                background: '#f9fafb',
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px'
            }
        }, JSON.stringify(out, null, 2));
    };

    return { Control, Preview };
}

// Keep named exports for backwards compatibility
const globalCMS = (typeof window !== 'undefined' && window.CMS) ? window.CMS : null;
const globalWidgets = globalCMS ? createKnowledgeWidget(globalCMS) : { Control: null, Preview: null };

export const CreateKnowledgeControl = globalWidgets.Control;
export const CreateKnowledgePreview = globalWidgets.Preview;
