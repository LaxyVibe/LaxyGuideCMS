# CreateKnowledge Widget

A custom Decap CMS widget for creating and managing knowledge with AI assistance.

## Structure

This widget follows the same architecture as the CreateAudioGuide widget, with a 4-step wizard workflow:

### Directory Structure

```
create-knowledge-widget/
├── package.json
├── src/
│   ├── index.js                    # Entry point
│   ├── decapWidget.js              # Widget registration
│   ├── controller/
│   │   └── wizardController.js     # Main controller with React hooks
│   ├── model/
│   │   └── state.js                # State management (hydrate/serialize)
│   ├── services/
│   │   ├── aiProcessing.js         # AI processing service
│   │   └── uploadService.js        # File upload service
│   └── views/
│       ├── WizardShell.js          # Main wizard shell component
│       └── steps/
│           ├── BasicInformation.js  # Step 1: Basic Information
│           ├── UploadMaterials.js   # Step 2: Upload Materials
│           ├── AiProcessing.js      # Step 3: AI Processing
│           └── VerifyKnowledge.js   # Step 4: Verify Knowledge
```

## 4-Step Workflow

1. **Basic Information** - Collect basic information about the knowledge base
2. **Upload Materials** - Handle file uploads and material management
3. **AI Processing** - Show AI processing progress and status
4. **Verify Knowledge** - Review and verify the processed knowledge

## Implementation Status

✅ Widget structure created
✅ All placeholder files created with basic scaffolding
⏳ Waiting for UI screenshots to implement detailed UI for each step

## Next Steps

1. Provide screenshots for each step
2. Implement detailed UI based on screenshots
3. Define state fields in `src/model/state.js`
4. Implement service logic in `src/services/`
5. Connect UI components to state and services

## Usage

The widget will be registered as `CreateKnowledge` in Decap CMS and can be used in collection configurations.
