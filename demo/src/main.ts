// ZenGrid grid + feature stylesheets
import '@zengrid/core/dist/styles.css';
import '@zengrid/core/styles/features/loading/loading.styles.css';
import '@zengrid/core/styles/features/column-resize/column-resize.styles.css';
import '@zengrid/core/styles/features/column-drag/column-drag.styles.css';
import 'vanilla-calendar-pro/styles/index.css';
import '@zengrid/core/styles/datetime-core/theming/datetime.css';

// Showcase design system
import './showcase/styles/design.css';
import './showcase/styles/shell.css';
import './showcase/styles/panel.css';

import { mountApp } from './showcase/app';

const root = document.getElementById('app');
if (root) mountApp(root);
