import React from 'react';
const h = React.createElement;

const tabs = [
    { id: 'documents', label: 'Documents' },
    { id: 'urls', label: 'URLs' },
    { id: 'images', label: 'Images' },
    { id: 'text', label: 'Text' }
];

export function UploadMaterials({ state, ctrl }) {
    const activeTab = state.uploadTab || 'documents';

    const handleTabChange = (tabId) => {
        ctrl.setState({ uploadTab: tabId });
    };

    const handleFileUpload = (type) => (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const fileData = files.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type,
                lastModified: f.lastModified
            }));

            if (type === 'documents') {
                ctrl.setField('uploadedDocuments', [...(state.uploadedDocuments || []), ...fileData]);
            } else if (type === 'images') {
                ctrl.setField('uploadedImages', [...(state.uploadedImages || []), ...fileData]);
            }
        }
    };

    const handleAddUrl = () => {
        if (state.seedUrl && state.seedUrl.trim()) {
            const newUrl = {
                url: state.seedUrl,
                crawlingRules: state.crawlingRules,
                includeMedia: state.includeMedia,
                addedAt: Date.now()
            };
            ctrl.setField('urls', [...(state.urls || []), newUrl]);
            ctrl.setState({ seedUrl: '' });
        }
    };

    const handleTextChange = (field) => (e) => {
        ctrl.setField('textContent', {
            ...state.textContent,
            [field]: e.target.value
        });
    };

    const handleAddTextContent = () => {
        if (state.textContent?.title || state.textContent?.content) {
            // In a real implementation, this would save the text content
            // For now, we'll just keep it in state
            ctrl.persist();
        }
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
            }, 'Upload Materials'),
            h('p', {
                key: 'subtitle',
                style: {
                    margin: '0',
                    fontSize: '14px',
                    color: '#6b7280'
                }
            }, 'Add documents, URLs, and media')
        ]),

        // Tabs
        h('div', {
            key: 'tabs',
            style: {
                display: 'flex',
                gap: '0',
                borderBottom: '1px solid #e5e7eb',
                marginBottom: '24px'
            }
        }, tabs.map(tab =>
            h('button', {
                key: tab.id,
                type: 'button',
                onClick: () => handleTabChange(tab.id),
                style: {
                    flex: '1',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    background: activeTab === tab.id ? '#f3f4f6' : 'transparent',
                    color: activeTab === tab.id ? '#111827' : '#6b7280',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                },
                onMouseEnter: (e) => {
                    if (activeTab !== tab.id) {
                        e.target.style.background = '#f9fafb';
                    }
                },
                onMouseLeave: (e) => {
                    if (activeTab !== tab.id) {
                        e.target.style.background = 'transparent';
                    }
                }
            }, tab.label)
        )),

        // Tab Content
        h('div', { key: 'tab-content' }, [
            // Documents Tab
            activeTab === 'documents' && h('div', {
                key: 'documents-content',
                style: {
                    minHeight: '300px'
                }
            }, [
                h('div', {
                    key: 'upload-area',
                    style: {
                        border: '2px dashed #d1d5db',
                        borderRadius: '8px',
                        padding: '48px 24px',
                        textAlign: 'center',
                        background: '#fafafa'
                    }
                }, [
                    h('div', {
                        key: 'icon',
                        style: {
                            fontSize: '48px',
                            color: '#9ca3af',
                            marginBottom: '16px'
                        }
                    }, '📄'),
                    h('h4', {
                        key: 'title',
                        style: {
                            margin: '0 0 8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#111827'
                        }
                    }, 'Upload Documents'),
                    h('p', {
                        key: 'subtitle',
                        style: {
                            margin: '0 0 16px',
                            fontSize: '14px',
                            color: '#6b7280'
                        }
                    }, 'PDF, Word, text files'),
                    h('label', {
                        key: 'button',
                        style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '500',
                            background: '#fff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        },
                        onMouseEnter: (e) => {
                            e.target.style.background = '#f9fafb';
                            e.target.style.borderColor = '#9ca3af';
                        },
                        onMouseLeave: (e) => {
                            e.target.style.background = '#fff';
                            e.target.style.borderColor = '#d1d5db';
                        }
                    }, [
                        h('span', { key: 'icon' }, '⬇'),
                        'Choose Files',
                        h('input', {
                            key: 'input',
                            type: 'file',
                            multiple: true,
                            accept: '.pdf,.doc,.docx,.txt',
                            onChange: handleFileUpload('documents'),
                            style: { display: 'none' }
                        })
                    ])
                ]),
                // Show uploaded files
                (state.uploadedDocuments || []).length > 0 && h('div', {
                    key: 'uploaded-list',
                    style: {
                        marginTop: '16px',
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '6px'
                    }
                }, [
                    h('p', {
                        key: 'count',
                        style: {
                            margin: '0 0 8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151'
                        }
                    }, `${state.uploadedDocuments.length} file(s) uploaded`)
                ])
            ]),

            // URLs Tab
            activeTab === 'urls' && h('div', {
                key: 'urls-content',
                style: {
                    minHeight: '300px'
                }
            }, [
                h('div', {
                    key: 'url-icon',
                    style: {
                        textAlign: 'center',
                        marginBottom: '24px'
                    }
                }, [
                    h('div', {
                        key: 'icon',
                        style: {
                            fontSize: '48px',
                            color: '#9ca3af',
                            marginBottom: '16px'
                        }
                    }, '🔗'),
                    h('h4', {
                        key: 'title',
                        style: {
                            margin: '0 0 8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#111827'
                        }
                    }, 'Web Crawling'),
                    h('p', {
                        key: 'subtitle',
                        style: {
                            margin: '0',
                            fontSize: '14px',
                            color: '#6b7280'
                        }
                    }, 'Extract content from websites and linked pages')
                ]),

                // Data source dropdown
                h('div', {
                    key: 'data-source',
                    style: {
                        marginBottom: '20px'
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
                    }, 'Data source'),
                    h('select', {
                        key: 'select',
                        value: 'url',
                        disabled: true,
                        style: {
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '14px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            background: '#fff',
                            color: '#374151',
                            outline: 'none',
                            cursor: 'pointer'
                        }
                    }, [
                        h('option', { key: 'url', value: 'url' }, 'URL for web crawling')
                    ])
                ]),

                // Crawling rules
                h('div', {
                    key: 'crawling-rules',
                    style: {
                        marginBottom: '20px'
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
                    }, 'Crawling rules'),

                    // Radio options
                    h('div', {
                        key: 'options',
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }
                    }, [
                        // Scoped crawl
                        h('label', {
                            key: 'scoped',
                            style: {
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                cursor: 'pointer'
                            }
                        }, [
                            h('input', {
                                key: 'radio',
                                type: 'radio',
                                name: 'crawlingRules',
                                value: 'scoped',
                                checked: state.crawlingRules === 'scoped',
                                onChange: (e) => ctrl.setField('crawlingRules', e.target.value),
                                style: {
                                    marginTop: '3px',
                                    cursor: 'pointer'
                                }
                            }),
                            h('div', { key: 'text' }, [
                                h('div', {
                                    key: 'title',
                                    style: {
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#111827',
                                        marginBottom: '4px'
                                    }
                                }, 'Scoped crawl'),
                                h('div', {
                                    key: 'desc',
                                    style: {
                                        fontSize: '13px',
                                        color: '#6b7280'
                                    }
                                }, 'Only crawl the seed URL')
                            ])
                        ]),

                        // URL and linked pages
                        h('label', {
                            key: 'linked',
                            style: {
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                cursor: 'pointer'
                            }
                        }, [
                            h('input', {
                                key: 'radio',
                                type: 'radio',
                                name: 'crawlingRules',
                                value: 'linked',
                                checked: state.crawlingRules === 'linked',
                                onChange: (e) => ctrl.setField('crawlingRules', e.target.value),
                                style: {
                                    marginTop: '3px',
                                    cursor: 'pointer'
                                }
                            }),
                            h('div', { key: 'text' }, [
                                h('div', {
                                    key: 'title',
                                    style: {
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#111827',
                                        marginBottom: '4px'
                                    }
                                }, 'URL and linked pages'),
                                h('div', {
                                    key: 'desc',
                                    style: {
                                        fontSize: '13px',
                                        color: '#6b7280'
                                    }
                                }, 'Crawl the seed URL and all pages linked from it')
                            ])
                        ]),

                        // Same domain
                        h('label', {
                            key: 'domain',
                            style: {
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                cursor: 'pointer'
                            }
                        }, [
                            h('input', {
                                key: 'radio',
                                type: 'radio',
                                name: 'crawlingRules',
                                value: 'domain',
                                checked: state.crawlingRules === 'domain',
                                onChange: (e) => ctrl.setField('crawlingRules', e.target.value),
                                style: {
                                    marginTop: '3px',
                                    cursor: 'pointer'
                                }
                            }),
                            h('div', { key: 'text' }, [
                                h('div', {
                                    key: 'title',
                                    style: {
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#111827',
                                        marginBottom: '4px'
                                    }
                                }, 'URL and all pages under the same domain'),
                                h('div', {
                                    key: 'desc',
                                    style: {
                                        fontSize: '13px',
                                        color: '#6b7280'
                                    }
                                }, 'Crawl all accessible pages within the same domain')
                            ])
                        ])
                    ]),

                    // Include media checkbox
                    h('label', {
                        key: 'media-checkbox',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '16px',
                            cursor: 'pointer'
                        }
                    }, [
                        h('input', {
                            key: 'checkbox',
                            type: 'checkbox',
                            checked: state.includeMedia || false,
                            onChange: (e) => ctrl.setField('includeMedia', e.target.checked),
                            style: {
                                cursor: 'pointer'
                            }
                        }),
                        h('span', {
                            key: 'label',
                            style: {
                                fontSize: '14px',
                                color: '#374151'
                            }
                        }, 'Index embedded media (images, videos, audio)')
                    ])
                ]),

                // Seed URL input
                h('div', {
                    key: 'seed-url',
                    style: {
                        marginBottom: '20px'
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
                    }, 'Seed URL'),
                    h('input', {
                        key: 'input',
                        type: 'url',
                        value: state.seedUrl || '',
                        onChange: (e) => ctrl.setState({ seedUrl: e.target.value }),
                        placeholder: 'https://example.com',
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
                    }),
                    h('p', {
                        key: 'examples',
                        style: {
                            margin: '8px 0 0',
                            fontSize: '12px',
                            color: '#9ca3af'
                        }
                    }, 'Examples: https://example.com, https://blog.example.com/category')
                ]),

                // Add URL button
                h('button', {
                    key: 'add-url-btn',
                    type: 'button',
                    onClick: handleAddUrl,
                    disabled: !state.seedUrl || !state.seedUrl.trim(),
                    style: {
                        width: '100%',
                        padding: '10px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        background: (!state.seedUrl || !state.seedUrl.trim()) ? '#e5e7eb' : '#111827',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: (!state.seedUrl || !state.seedUrl.trim()) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    },
                    onMouseEnter: (e) => {
                        if (state.seedUrl && state.seedUrl.trim()) {
                            e.target.style.background = '#374151';
                        }
                    },
                    onMouseLeave: (e) => {
                        if (state.seedUrl && state.seedUrl.trim()) {
                            e.target.style.background = '#111827';
                        }
                    }
                }, [
                    h('span', { key: 'icon' }, '➕'),
                    'Add URL'
                ]),

                // Info box
                h('div', {
                    key: 'info-box',
                    style: {
                        marginTop: '20px',
                        padding: '12px 16px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        display: 'flex',
                        gap: '12px'
                    }
                }, [
                    h('div', {
                        key: 'icon',
                        style: {
                            fontSize: '16px',
                            color: '#3b82f6'
                        }
                    }, 'ℹ️'),
                    h('div', { key: 'text' }, [
                        h('p', {
                            key: 'title',
                            style: {
                                margin: '0 0 4px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#1e40af'
                            }
                        }, 'Automatic exclusions:'),
                        h('p', {
                            key: 'desc',
                            style: {
                                margin: '0',
                                fontSize: '13px',
                                color: '#1e40af'
                            }
                        }, 'Files like PDFs, images, videos, and non-text content are automatically excluded from text extraction but can be indexed as references.')
                    ])
                ]),

                // How web crawling works link
                h('div', {
                    key: 'help-link',
                    style: {
                        marginTop: '16px',
                        textAlign: 'center'
                    }
                }, [
                    h('a', {
                        key: 'link',
                        href: '#',
                        onClick: (e) => e.preventDefault(),
                        style: {
                            fontSize: '14px',
                            color: '#3b82f6',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }
                    }, 'How web crawling works')
                ]),

                // Show added URLs
                (state.urls || []).length > 0 && h('div', {
                    key: 'urls-list',
                    style: {
                        marginTop: '24px',
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '6px'
                    }
                }, [
                    h('p', {
                        key: 'count',
                        style: {
                            margin: '0 0 8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151'
                        }
                    }, `${state.urls.length} URL(s) added`)
                ])
            ]),

            // Images Tab
            activeTab === 'images' && h('div', {
                key: 'images-content',
                style: {
                    minHeight: '300px'
                }
            }, [
                h('div', {
                    key: 'upload-area',
                    style: {
                        border: '2px dashed #d1d5db',
                        borderRadius: '8px',
                        padding: '48px 24px',
                        textAlign: 'center',
                        background: '#fafafa'
                    }
                }, [
                    h('div', {
                        key: 'icon',
                        style: {
                            fontSize: '48px',
                            color: '#9ca3af',
                            marginBottom: '16px'
                        }
                    }, '🖼️'),
                    h('h4', {
                        key: 'title',
                        style: {
                            margin: '0 0 8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#111827'
                        }
                    }, 'Upload Images'),
                    h('p', {
                        key: 'subtitle',
                        style: {
                            margin: '0 0 16px',
                            fontSize: '14px',
                            color: '#6b7280'
                        }
                    }, 'Photos, icons, diagrams'),
                    h('label', {
                        key: 'button',
                        style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '500',
                            background: '#fff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        },
                        onMouseEnter: (e) => {
                            e.target.style.background = '#f9fafb';
                            e.target.style.borderColor = '#9ca3af';
                        },
                        onMouseLeave: (e) => {
                            e.target.style.background = '#fff';
                            e.target.style.borderColor = '#d1d5db';
                        }
                    }, [
                        h('span', { key: 'icon' }, '⬇'),
                        'Choose Files',
                        h('input', {
                            key: 'input',
                            type: 'file',
                            multiple: true,
                            accept: 'image/*',
                            onChange: handleFileUpload('images'),
                            style: { display: 'none' }
                        })
                    ])
                ]),
                // Show uploaded images
                (state.uploadedImages || []).length > 0 && h('div', {
                    key: 'uploaded-list',
                    style: {
                        marginTop: '16px',
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '6px'
                    }
                }, [
                    h('p', {
                        key: 'count',
                        style: {
                            margin: '0 0 8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151'
                        }
                    }, `${state.uploadedImages.length} image(s) uploaded`)
                ])
            ]),

            // Text Tab
            activeTab === 'text' && h('div', {
                key: 'text-content',
                style: {
                    minHeight: '300px'
                }
            }, [
                h('div', {
                    key: 'text-icon',
                    style: {
                        textAlign: 'center',
                        marginBottom: '24px'
                    }
                }, [
                    h('div', {
                        key: 'icon',
                        style: {
                            fontSize: '48px',
                            color: '#9ca3af',
                            marginBottom: '16px'
                        }
                    }, '📄'),
                    h('h4', {
                        key: 'title',
                        style: {
                            margin: '0 0 8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#111827'
                        }
                    }, 'Direct Text Input'),
                    h('p', {
                        key: 'subtitle',
                        style: {
                            margin: '0',
                            fontSize: '14px',
                            color: '#6b7280'
                        }
                    }, 'Add content directly with a title and description')
                ]),

                // Title input
                h('div', {
                    key: 'title-field',
                    style: {
                        marginBottom: '20px'
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
                        'Title ',
                        h('span', { style: { color: '#ef4444' } }, '*')
                    ]),
                    h('input', {
                        key: 'input',
                        type: 'text',
                        value: state.textContent?.title || '',
                        onChange: handleTextChange('title'),
                        placeholder: 'e.g., Museum History, Exhibition Guide',
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

                // Content textarea
                h('div', {
                    key: 'content-field',
                    style: {
                        marginBottom: '20px'
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
                        'Content ',
                        h('span', { style: { color: '#ef4444' } }, '*')
                    ]),
                    h('textarea', {
                        key: 'textarea',
                        value: state.textContent?.content || '',
                        onChange: handleTextChange('content'),
                        placeholder: 'Enter your content here...',
                        rows: 8,
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
                    }),
                    h('p', {
                        key: 'char-count',
                        style: {
                            margin: '8px 0 0',
                            fontSize: '12px',
                            color: '#9ca3af',
                            textAlign: 'right'
                        }
                    }, `${(state.textContent?.content || '').length} characters`)
                ]),

                // Add Text Content button
                h('button', {
                    key: 'add-text-btn',
                    type: 'button',
                    onClick: handleAddTextContent,
                    disabled: !state.textContent?.title || !state.textContent?.content,
                    style: {
                        width: '100%',
                        padding: '10px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        background: (!state.textContent?.title || !state.textContent?.content) ? '#e5e7eb' : '#111827',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: (!state.textContent?.title || !state.textContent?.content) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: (e) => {
                        if (state.textContent?.title && state.textContent?.content) {
                            e.target.style.background = '#374151';
                        }
                    },
                    onMouseLeave: (e) => {
                        if (state.textContent?.title && state.textContent?.content) {
                            e.target.style.background = '#111827';
                        }
                    }
                }, [
                    h('span', { key: 'icon' }, '➕'),
                    ' Add Text Content'
                ]),

                // Info box
                h('div', {
                    key: 'info-box',
                    style: {
                        marginTop: '20px',
                        padding: '12px 16px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        display: 'flex',
                        gap: '12px'
                    }
                }, [
                    h('div', {
                        key: 'icon',
                        style: {
                            fontSize: '16px',
                            color: '#3b82f6'
                        }
                    }, 'ℹ️'),
                    h('div', { key: 'text' }, [
                        h('p', {
                            key: 'title',
                            style: {
                                margin: '0 0 4px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#1e40af'
                            }
                        }, 'Text content tips:'),
                        h('p', {
                            key: 'desc',
                            style: {
                                margin: '0',
                                fontSize: '13px',
                                color: '#1e40af'
                            }
                        }, 'Add historical information, descriptions, facts, or any text-based knowledge you want to include in your knowledge base.')
                    ])
                ])
            ])
        ])
    ]);
}

