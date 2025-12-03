import React from 'react';
const h = React.createElement;

export function VerifyKnowledge({ state, ctrl }) {
    const extractedFacts = state.extractedFacts || [];
    const pointsOfInterest = state.pointsOfInterest || [];
    const contentStructure = state.contentStructure || [];
    const verificationComplete = state.verificationComplete || false;

    const handleMarkComplete = () => {
        ctrl.setField('verificationComplete', true);
    };

    const renderSection = (title, items, itemCount, sectionKey) => {
        return h('div', {
            key: sectionKey,
            style: {
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '16px',
                overflow: 'hidden'
            }
        }, [
            // Section Header
            h('div', {
                key: 'header',
                style: {
                    padding: '16px 20px',
                    background: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            }, [
                h('div', { key: 'title-section' }, [
                    h('h4', {
                        key: 'title',
                        style: {
                            margin: '0 0 4px',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#111827'
                        }
                    }, title),
                    h('p', {
                        key: 'subtitle',
                        style: {
                            margin: '0',
                            fontSize: '13px',
                            color: '#6b7280'
                        }
                    }, sectionKey === 'facts'
                        ? 'AI has identified important facts, dates, and descriptions from your materials.'
                        : sectionKey === 'pois'
                            ? 'Locations and attractions that can be featured in tours and guides.'
                            : 'How your content is organized for web pages and audio guides.'
                    )
                ]),
                h('div', {
                    key: 'count',
                    style: {
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#3b82f6',
                        background: '#eff6ff',
                        padding: '4px 12px',
                        borderRadius: '12px'
                    }
                }, `${itemCount} items extracted`)
            ]),

            // Section Content
            h('div', {
                key: 'content',
                style: {
                    padding: '20px'
                }
            }, [
                h('button', {
                    key: 'edit-btn',
                    type: 'button',
                    style: {
                        width: '100%',
                        padding: '10px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        background: '#fff',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    },
                    onMouseEnter: (e) => {
                        e.target.style.background = '#f9fafb';
                        e.target.style.borderColor = '#9ca3af';
                    },
                    onMouseLeave: (e) => {
                        e.target.style.background = '#fff';
                        e.target.style.borderColor = '#d1d5db';
                    },
                    onClick: () => {
                        // In a real implementation, this would open an editor
                        alert('Edit functionality would open here');
                    }
                }, [
                    h('span', { key: 'icon' }, '✏️'),
                    'Review & Edit'
                ])
            ])
        ]);
    };

    return h('div', {
        style: {
            padding: '0',
            background: '#fff'
        }
    }, [
        // Header
        h('div', {
            key: 'header',
            style: {
                marginBottom: '24px'
            }
        }, [
            h('h3', {
                key: 'title',
                style: {
                    margin: '0 0 8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827'
                }
            }, 'Verify Knowledge'),
            h('p', {
                key: 'subtitle',
                style: {
                    margin: '0',
                    fontSize: '14px',
                    color: '#6b7280'
                }
            }, 'Review and refine extracted information')
        ]),

        // Verification Instructions
        h('div', {
            key: 'instructions',
            style: {
                marginBottom: '24px'
            }
        }, [
            h('h4', {
                key: 'title',
                style: {
                    margin: '0 0 8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827'
                }
            }, 'Knowledge Verification'),
            h('p', {
                key: 'desc',
                style: {
                    margin: '0',
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.6'
                }
            }, 'Review the extracted information and make corrections if needed')
        ]),

        // Extracted Sections
        renderSection(
            'Key Facts & Information',
            extractedFacts,
            extractedFacts.length,
            'facts'
        ),

        renderSection(
            'Points of Interest',
            pointsOfInterest,
            pointsOfInterest.length,
            'pois'
        ),

        renderSection(
            'Content Structure',
            contentStructure,
            contentStructure.length,
            'structure'
        ),

        // Success Message (shown when complete)
        verificationComplete && h('div', {
            key: 'success-message',
            style: {
                marginTop: '24px',
                padding: '16px 20px',
                background: '#d1fae5',
                border: '1px solid #6ee7b7',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }
        }, [
            h('div', {
                key: 'icon',
                style: {
                    fontSize: '24px'
                }
            }, '✓'),
            h('div', { key: 'text' }, [
                h('p', {
                    key: 'title',
                    style: {
                        margin: '0 0 4px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#065f46'
                    }
                }, 'Knowledge base is ready!'),
                h('p', {
                    key: 'desc',
                    style: {
                        margin: '0',
                        fontSize: '13px',
                        color: '#047857'
                    }
                }, 'All materials have been processed successfully. You can now start generating content.')
            ])
        ]),

        // Mark as Complete Button (if not complete)
        !verificationComplete && h('div', {
            key: 'complete-section',
            style: {
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb'
            }
        }, [
            h('button', {
                key: 'complete-btn',
                type: 'button',
                onClick: handleMarkComplete,
                style: {
                    width: '100%',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: '#111827',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                },
                onMouseEnter: (e) => {
                    e.target.style.background = '#374151';
                },
                onMouseLeave: (e) => {
                    e.target.style.background = '#111827';
                }
            }, [
                h('span', { key: 'icon' }, '✓'),
                'Complete & View Knowledge Base'
            ])
        ])
    ]);
}

