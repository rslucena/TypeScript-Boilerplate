import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import 'virtual:group-icons.css'
import { initComponent } from 'vitepress-mermaid-preview/component';
import 'vitepress-mermaid-preview/dist/index.css';
import Footer from './Footer.vue'
import './style.css'

import InteractiveFlow from './components/InteractiveFlow.vue'
import DiagramBuilder from './components/DiagramBuilder.vue'
import EnvironmentSelector from './components/EnvironmentSelector.vue'

export default {
    extends: DefaultTheme,
    Layout: () => {
        return h(DefaultTheme.Layout, null, {
            'nav-bar-content-after': () => h(EnvironmentSelector),
            'layout-bottom': () => h(Footer)
        });
    },
    enhanceApp({ app }) {
        initComponent(app);
        app.component('InteractiveFlow', InteractiveFlow)
        app.component('DiagramBuilder', DiagramBuilder)
    },
} satisfies Theme;
