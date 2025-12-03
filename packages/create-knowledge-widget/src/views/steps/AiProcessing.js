import React, { useEffect } from 'react';
const h = React.createElement;

export function AiProcessing({ state, ctrl }) {
    const processingStatus = state.processingStatus || 'idle';
    const processingStages = state.processingStages || [];
    const processingProgress = state.processingProgress || 0;

    // Auto-start processing when entering this step
    useEffect(() => {
        if (!state.processingStarted && processingStatus === 'idle') {
            startProcessing();
        }
    }, []);

    const startProcessing = () => {
        ctrl.setState({ processingStarted: true, processingStatus: 'processing' });

        // Simulate AI processing stages
        const stages = [...processingStages];
        let currentStage = 0;
        let progress = 0;

        const interval = setInterval(() => {
            progress += 2;

            // Update stage status based on progress
            if (progress >= 25 && currentStage < 1) {
                stages[0].status = 'complete';
                stages[1].status = 'processing';
                currentStage = 1;
            } else if (progress >= 50 && currentStage < 2) {
                stages[1].status = 'complete';
                stages[2].status = 'processing';
                currentStage = 2;
            } else if (progress >= 75 && currentStage < 3) {
                stages[2].status = 'complete';
                stages[3].status = 'processing';
                currentStage = 3;
            } else if (progress >= 100) {
                stages[3].status = 'complete';
                ctrl.setState({
                    processingStatus: 'complete',
                    processingProgress: 100,
                    processingStages: stages,
                    // Mock extracted data for verification step
                    extractedFacts: [
                        { id: 1, title: 'Museum History', content: 'Founded in 1870...', verified: false },
                        { id: 2, title: 'Main Collections', content: 'Ancient artifacts...', verified: false }
                    ],
                    pointsOfInterest: [
                        { id: 1, name: 'Grand Hall', description: 'Main entrance...', verified: false },
                        { id: 2, name: 'Egyptian Wing', description: 'Ancient Egypt...', verified: false }
                    ],
                    contentStructure: [
                        { id: 1, section: 'Introduction', pages: 3, verified: false },
                        { id: 2, section: 'Exhibitions', pages: 5, verified: false }
                    ]
                });
                clearInterval(interval);
                return;
            }

            ctrl.setState({
                processingProgress: progress,
                processingStages: stages
            });
        }, 100);
    };

    const getStatusIcon = (status) => {
        if (status === 'complete') return '✓';
        if (status === 'processing') return '⟳';
        return '○';
    };

    const getStatusColor = (status) => {
        if (status === 'complete') return '#10b981';
        if (status === 'processing') return '#3b82f6';
        return '#d1d5db';
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
            }, 'AI Processing'),
            h('p', {
                key: 'subtitle',
                style: {
                    margin: '0',
                    fontSize: '14px',
                    color: '#6b7280'
                }
            }, 'AI analyzes and structures your content')
        ]),

        // Processing Status Card
        h('div', {
            key: 'status-card',
            style: {
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center',
                background: '#fafafa',
                marginBottom: '32px'
            }
        }, [
            // AI Icon
            h('div', {
                key: 'icon',
                style: {
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 20px',
                    background: processingStatus === 'complete' ? '#10b981' : '#3b82f6',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    color: '#fff',
                    animation: processingStatus === 'processing' ? 'pulse 2s infinite' : 'none'
                }
            }, processingStatus === 'complete' ? '✓' : '🤖'),

            // Status Title
            h('h4', {
                key: 'status-title',
                style: {
                    margin: '0 0 8px',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827'
                }
            }, processingStatus === 'complete' ? 'Processing Complete!' : 'AI is processing your materials'),

            // Status Description
            h('p', {
                key: 'status-desc',
                style: {
                    margin: '0 0 24px',
                    fontSize: '14px',
                    color: '#6b7280'
                }
            }, processingStatus === 'complete'
                ? 'All materials have been processed successfully. You can now start generating content.'
                : 'Our AI is analyzing 0 materials to extract and structure knowledge for your knowledge base.'
            )
        ]),

        // Processing Stages
        h('div', {
            key: 'stages',
            style: {
                marginBottom: '24px'
            }
        }, processingStages.map((stage, index) =>
            h('div', {
                key: stage.id,
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: index < processingStages.length - 1 ? '1px solid #f3f4f6' : 'none'
                }
            }, [
                // Status Icon
                h('div', {
                    key: 'icon',
                    style: {
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: stage.status === 'complete' ? '#10b981' :
                            stage.status === 'processing' ? '#3b82f6' : '#e5e7eb',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        flexShrink: 0,
                        animation: stage.status === 'processing' ? 'spin 1s linear infinite' : 'none'
                    }
                }, getStatusIcon(stage.status)),

                // Stage Label
                h('div', {
                    key: 'label',
                    style: {
                        flex: 1,
                        fontSize: '14px',
                        color: stage.status === 'pending' ? '#9ca3af' : '#374151',
                        fontWeight: stage.status === 'processing' ? '500' : '400'
                    }
                }, stage.label),

                // Status Indicator
                stage.status === 'complete' && h('div', {
                    key: 'status',
                    style: {
                        fontSize: '12px',
                        color: '#10b981',
                        fontWeight: '500'
                    }
                }, '✓')
            ])
        )),

        // Progress Bar
        h('div', {
            key: 'progress-section',
            style: {
                marginTop: '24px'
            }
        }, [
            h('div', {
                key: 'progress-bar-bg',
                style: {
                    width: '100%',
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }
            }, [
                h('div', {
                    key: 'progress-bar-fill',
                    style: {
                        width: `${processingProgress}%`,
                        height: '100%',
                        background: processingStatus === 'complete' ? '#10b981' : '#111827',
                        transition: 'width 0.3s ease',
                        borderRadius: '4px'
                    }
                })
            ]),
            h('p', {
                key: 'progress-text',
                style: {
                    margin: '12px 0 0',
                    fontSize: '13px',
                    color: '#6b7280',
                    textAlign: 'center'
                }
            }, processingStatus === 'complete'
                ? 'Processing complete!'
                : 'Processing... This may take a few minutes'
            )
        ]),

        // Add CSS animations
        h('style', { key: 'animations' }, `
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `)
    ]);
}

