// Entry point that registers the widget with Decap CMS (refactored)
const registerWidget = (window.CMS && window.CMS.registerWidget) || (window.registerWidget);
import './decapWidget';
// decapWidget performs registration internally
