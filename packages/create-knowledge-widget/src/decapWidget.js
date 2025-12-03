// Decap widget registration using refactored controller
const registerWidget = (window.CMS && window.CMS.registerWidget) || window.registerWidget;
import { CreateKnowledgeControl, CreateKnowledgePreview } from './controller/wizardController';
registerWidget('CreateKnowledge', CreateKnowledgeControl, CreateKnowledgePreview);
