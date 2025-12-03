import React from 'react';
const h = React.createElement;

const contentTypes = [
    'Museum', 'Park', 'Landmark', 'Temple',
    'Market', 'Gallery', 'Monument', 'Other'
];

export function BasicInformation({ state, ctrl }) {
    const [isGenerating, setIsGenerating] = React.useState(false);

    const handleInputChange = (field) => (e) => {
        ctrl.setField(field, e.target.value);
    };

    const handleContentTypeSelect = (type) => {
        ctrl.setField('contentType', type);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    const handleGenerateDescription = async () => {
        if (!state.knowledgeBaseName) {
            alert('Please enter a Knowledge Base Name first.');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/.netlify/functions/generate-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: state.knowledgeBaseName }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate description');
            }

            const data = await response.json();
            if (data.description) {
                ctrl.setField('description', data.description);
            }
        } catch (error) {
            console.error('Error generating description:', error);
            alert('Failed to generate description. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return h('div', {
        style: {
            padding: '0',
            background: '#fff',
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
            }, 'Basic Information'),
            h('p', {
                key: 'subtitle',
                style: {
                    margin: '0',
                    fontSize: '14px',
                    color: '#6b7280'
                }
            }, 'Name and describe your knowledge base')
        ]),

        // Knowledge Base Name
        h('div', {
            key: 'name-field',
            style: {
                marginBottom: '24px'
            }
        }, [
            h('label', {
                key: 'label',
                style: {
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                }
            }, [
                'Knowledge Base Name ',
                h('span', { style: { color: '#ef4444' } }, '*')
            ]),
            h('input', {
                key: 'input',
                type: 'text',
                value: state.knowledgeBaseName || '',
                onChange: handleInputChange('knowledgeBaseName'),
                onKeyDown: handleKeyDown,
                placeholder: 'e.g., Metropolitan Museum Guide',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                },
                onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                onBlur: (e) => e.target.style.borderColor = '#d1d5db'
            })
        ]),

        // Description
        h('div', {
            key: 'description-field',
            style: {
                marginBottom: '24px'
            }
        }, [
            h('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                }
            }, [
                h('label', {
                    key: 'label',
                    style: {
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        margin: 0
                    }
                }, 'Description'),
                h('button', {
                    key: 'ai-btn',
                    onClick: handleGenerateDescription,
                    disabled: isGenerating,
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: isGenerating ? '#9ca3af' : '#4f46e5',
                        background: isGenerating ? '#f3f4f6' : '#eef2ff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isGenerating ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: (e) => {
                        if (!isGenerating) e.target.style.background = '#e0e7ff';
                    },
                    onMouseLeave: (e) => {
                        if (!isGenerating) e.target.style.background = '#eef2ff';
                    }
                }, [
                    // Sparkles Icon
                    h('svg', {
                        width: '14',
                        height: '14',
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: '2',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                    }, [
                        h('path', { d: 'M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z' }), // Magic wand like shape or sparkles
                        h('path', { d: 'M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2' }),
                        h('path', { d: 'M19 11h2m-1 -1v2' })
                    ].map((path, i) => React.cloneElement(path, { key: i }))), // Simple sparkles icon
                    isGenerating ? 'Generating...' : 'AI Generate'
                ])
            ]),
            h('textarea', {
                key: 'textarea',
                value: state.description || '',
                onChange: handleInputChange('description'),
                placeholder: 'Describe what this knowledge base covers...',
                rows: 4,
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                },
                onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                onBlur: (e) => e.target.style.borderColor = '#d1d5db'
            })
        ]),

        // Content Type
        h('div', {
            key: 'content-type-field',
            style: {
                marginBottom: '24px'
            }
        }, [
            h('label', {
                key: 'label',
                style: {
                    display: 'block',
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                }
            }, 'Content Type'),
            h('div', {
                key: 'grid',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px'
                }
            }, contentTypes.map(type =>
                h('button', {
                    key: type,
                    type: 'button',
                    onClick: () => handleContentTypeSelect(type),
                    style: {
                        padding: '10px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        border: state.contentType === type ? '2px solid #3b82f6' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        background: state.contentType === type ? '#eff6ff' : '#fff',
                        color: state.contentType === type ? '#3b82f6' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none'
                    },
                    onMouseEnter: (e) => {
                        if (state.contentType !== type) {
                            e.target.style.borderColor = '#9ca3af';
                            e.target.style.background = '#f9fafb';
                        }
                    },
                    onMouseLeave: (e) => {
                        if (state.contentType !== type) {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.background = '#fff';
                        }
                    }
                }, type)
            ))
        ]),

        // Tags
        h('div', {
            key: 'tags-field',
            style: {
                marginBottom: '0'
            }
        }, [
            h('label', {
                key: 'label',
                style: {
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                }
            }, 'Tags'),
            h('input', {
                key: 'input',
                type: 'text',
                value: state.tags || '',
                onChange: handleInputChange('tags'),
                onKeyDown: handleKeyDown,
                placeholder: 'Add tags (press Enter)',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                },
                onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                onBlur: (e) => e.target.style.borderColor = '#d1d5db'
            })
        ])
    ]);
}

