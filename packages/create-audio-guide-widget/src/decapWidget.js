// Decap widget registration using refactored controller
const registerWidget = (window.CMS && window.CMS.registerWidget) || window.registerWidget;
import { CreateAudioGuideControl, CreateAudioGuidePreview } from './controller/wizardController';
registerWidget('CreateAudioGuide', CreateAudioGuideControl, CreateAudioGuidePreview);
