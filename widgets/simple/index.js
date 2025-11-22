// Simple custom widgets for Decap CMS

// 1) Simple color widget (kept in case you still want to use it elsewhere)
const SimpleColorControl = createClass({
  render: function () {
    const value = this.props.value || '#000000';
    return h('input', {
      type: 'color',
      value: value,
      onChange: this.handleChange,
    });
  },
  handleChange: function (e) {
    this.props.onChange(e.target.value);
  },
});

const SimpleColorPreview = createClass({
  render: function () {
    const value = this.props.value || '#000000';
    return h(
      'div',
      {
        style: {
          width: '100%',
          height: '40px',
          backgroundColor: value,
        },
      },
      value
    );
  },
});

CMS.registerWidget('simpleColor', SimpleColorControl, SimpleColorPreview);

// 2) Audio guide widget: single field value storing JSON { script, url, model, voiceId }
const AudioGuideControl = createClass({
  getInitialState: function () {
    const raw = this.props.value || '';
    let script = '';
    let url = '';
    let model = 'speech-2.6-hd';
    let voiceId = 'English_expressive_narrator';
    try {
      const parsed = JSON.parse(raw);
      script = parsed.script || '';
      url = parsed.url || '';
      model = parsed.model || model;
      voiceId = parsed.voiceId || voiceId;
    } catch (e) {
      script = raw || '';
      url = '';
    }
    return { showDialog: false, script, url, model, voiceId, isSaving: false, error: null };
  },

  componentDidUpdate: function (prevProps) {
    if (this.props.value !== prevProps.value) {
      const raw = this.props.value || '';
      let script = '';
      let url = '';
      let model = 'speech-2.6-hd';
      let voiceId = 'English_expressive_narrator';
      try {
        const parsed = JSON.parse(raw);
        script = parsed.script || '';
        url = parsed.url || '';
        model = parsed.model || model;
        voiceId = parsed.voiceId || voiceId;
      } catch (e) {
        script = raw || '';
        url = '';
      }
      this.setState({ script, url, model, voiceId });
    }
  },

  openDialog: function () {
    this.setState({ showDialog: true, error: null });
  },

  closeDialog: function () {
    this.setState({ showDialog: false, error: null });
  },

  propagateChange: function () {
    const value = JSON.stringify({
      script: this.state.script || '',
      url: this.state.url || '',
      model: this.state.model || 'speech-2.6-hd',
      voiceId: this.state.voiceId || 'English_expressive_narrator',
    });
    this.props.onChange && this.props.onChange(value);
  },

  handleScriptChange: function (e) {
    const script = e.target.value;
    this.setState({ script }, this.propagateChange);
  },

  handleUrlChange: function (e) {
    const url = e.target.value;
    this.setState({ url }, this.propagateChange);
  },

  handleModelChange: function (e) {
    const model = e.target.value;
    this.setState({ model }, this.propagateChange);
  },

  handleVoiceChange: function (e) {
    const voiceId = e.target.value;
    this.setState({ voiceId }, this.propagateChange);
  },

  handleGenerateWithAI: function () {
    const script = this.state.script || '';
    if (!script) {
      this.setState({ error: 'Please enter a script before generating audio.' });
      return;
    }
    this.setState({ isSaving: true, error: null });
    fetch('/.netlify/functions/generate-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script,
        model: this.state.model || 'speech-2.6-hd',
        voiceId: this.state.voiceId || 'English_expressive_narrator',
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to generate audio');
        return res.json();
      })
      .then((json) => {
        const url = json && json.url ? json.url : '';
        this.setState({ url, isSaving: false }, this.propagateChange);
      })
      .catch((err) => {
        this.setState({ isSaving: false, error: err.message || 'Error generating audio' });
      });
  },

  renderDialog: function () {
    if (!this.state.showDialog) return null;

    const overlayStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
    const dialogStyle = {
      backgroundColor: '#fff',
      padding: '16px',
      width: '540px',
      maxWidth: '95%',
      borderRadius: '4px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    };
    const labelStyle = {
      display: 'block',
      fontWeight: '600',
      marginBottom: '4px',
    };
    const textareaStyle = {
      width: '100%',
      minHeight: '120px',
      marginBottom: '12px',
      fontFamily: 'monospace',
      fontSize: '13px',
    };
    const inputStyle = {
      width: '100%',
      marginBottom: '12px',
      fontSize: '13px',
    };
    const selectStyle = {
      width: '100%',
      marginBottom: '12px',
      fontSize: '13px',
    };
    const buttonRowStyle = {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px',
      marginTop: '8px',
    };
    const primaryButtonStyle = {
      padding: '6px 12px',
      backgroundColor: '#111827',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    };
    const secondaryButtonStyle = {
      padding: '6px 12px',
      backgroundColor: '#e5e7eb',
      color: '#111827',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    };
    const errorStyle = {
      color: '#b91c1c',
      fontSize: '12px',
      marginTop: '4px',
    };
    const audioWrapperStyle = {
      marginTop: '4px',
      marginBottom: '12px',
    };

    const modelOptions = [
      'speech-2.6-hd',
      'speech-2.6-turbo',
      'speech-02-hd',
      'speech-02-turbo',
      'speech-01-hd',
      'speech-01-turbo',
    ];

    const voiceOptions = [
      { id: 'English_expressive_narrator', label: 'Expressive Narrator' },
      { id: 'English_radiant_girl', label: 'Radiant Girl' },
      { id: 'English_magnetic_voiced_man', label: 'Magnetic-voiced Male' },
      { id: 'English_compelling_lady1', label: 'Compelling Lady' },
    ];

    return h(
      'div',
      { style: overlayStyle },
      h(
        'div',
        { style: dialogStyle },
        [
          h('h3', { style: { marginTop: 0, marginBottom: '12px' } }, 'Audio Guide'),

          h('label', { style: labelStyle }, 'Model'),
          h(
            'select',
            {
              style: selectStyle,
              value: this.state.model,
              onChange: this.handleModelChange,
            },
            modelOptions.map((m) =>
              h('option', { key: m, value: m }, m)
            )
          ),

          h('label', { style: labelStyle }, 'Voice'),
          h(
            'select',
            {
              style: selectStyle,
              value: this.state.voiceId,
              onChange: this.handleVoiceChange,
            },
            voiceOptions.map((v) =>
              h('option', { key: v.id, value: v.id }, v.label)
            )
          ),

          h('label', { style: labelStyle }, 'Script'),
          h('textarea', {
            style: textareaStyle,
            value: this.state.script,
            onChange: this.handleScriptChange,
            placeholder: 'Enter the spoken script for this audio guide...',
          }),

          h('label', { style: labelStyle }, 'Audio URL'),
          h('input', {
            style: inputStyle,
            type: 'text',
            value: this.state.url,
            onChange: this.handleUrlChange,
            placeholder: 'https://... (URL of the audio file)',
          }),

          this.state.url
            ? h(
                'div',
                { style: audioWrapperStyle },
                h('audio', {
                  controls: true,
                  src: this.state.url,
                })
              )
            : null,

          this.state.error
            ? h('div', { style: errorStyle }, this.state.error)
            : null,

          h(
            'div',
            { style: buttonRowStyle },
            [
              h(
                'button',
                {
                  type: 'button',
                  style: secondaryButtonStyle,
                  onClick: this.closeDialog,
                },
                'Cancel'
              ),
              h(
                'button',
                {
                  type: 'button',
                  style: primaryButtonStyle,
                  onClick: this.handleGenerateWithAI,
                  disabled: this.state.isSaving,
                },
                this.state.isSaving ? 'Generating...' : 'Generate with AI'
              ),
              h(
                'button',
                {
                  type: 'button',
                  style: primaryButtonStyle,
                  onClick: this.closeDialog,
                },
                'OK'
              ),
            ]
          ),
        ]
      )
    );
  },

  render: function () {
    const script = this.state.script || '';
    const url = this.state.url || '';
    const valueSummary = !script && !url
      ? 'No audio guide set'
      : (script ? script.slice(0, 40) + (script.length > 40 ? '…' : '') : '') + ' | ' + (url || '');

    const containerStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    };
    const summaryStyle = {
      fontSize: '12px',
      color: '#4b5563',
      flexGrow: 1,
      wordBreak: 'break-all',
    };
    const buttonStyle = {
      padding: '6px 12px',
      backgroundColor: '#111827',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '13px',
    };

    return h(
      'div',
      null,
      [
        h(
          'div',
          { style: containerStyle },
          [
            h('div', { style: summaryStyle }, valueSummary),
            h(
              'button',
              {
                type: 'button',
                style: buttonStyle,
                onClick: this.openDialog,
              },
              script || url ? 'Edit Audio Guide' : 'Set Audio Guide'
            ),
          ]
        ),
        this.renderDialog(),
      ]
    );
  },
});

const AudioGuidePreview = createClass({
  render: function () {
    const raw = this.props.value || '';
    let script = '';
    let url = '';
    let model = '';
    let voiceId = '';
    try {
      const parsed = JSON.parse(raw);
      script = parsed.script || '';
      url = parsed.url || '';
      model = parsed.model || '';
      voiceId = parsed.voiceId || '';
    } catch (e) {
      script = raw || '';
      url = '';
    }

    const containerStyle = {
      fontSize: '12px',
      color: '#4b5563',
      whiteSpace: 'pre-wrap',
    };

    return h(
      'div',
      { style: containerStyle },
      script || url || model || voiceId
        ? JSON.stringify({ script, url, model, voiceId }, null, 2)
        : 'No audio guide set'
    );
  },
});

CMS.registerWidget('audioGuide', AudioGuideControl, AudioGuidePreview);
