import { defineConfig } from "vitepress";
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { vitepressMermaidPreview } from 'vitepress-mermaid-preview';

export default defineConfig({
    base: '/TypeScript-Boilerplate/',
    markdown: {
        config(md) {
            md.use(groupIconMdPlugin);
            md.use(vitepressMermaidPreview, { showToolbar: true });
        },
    },
    vite: {
        plugins: [groupIconVitePlugin()],
    },
    title: "Boilerplate",
    description: "Blazing-fast TS Boilerplate featuring a Zero-Dep Template Engine, Auto-CRUD Scaffolding, i18n, and Smart Caching. Optimized for Bun. Experience the speed of Go with the familiarity of TypeScript.",
    themeConfig: {
        nav: [
            { text: "Home", link: "/" },
            { text: "Guide", link: "/guide" },
            { text: "Reference", link: "/reference/cache-actions-reference" },
        ],
        // Sidebar dinâmica por rota
        sidebar: {
            '/guide/': [
                {
                    text: "Guide",
                    link: "/guide",
                    items: [
                        { text: "Getting Started", link: "/guide/getting-started" },
                        { text: "Scripts & Development", link: "/guide/scripts-&-development" },
                        { text: "Runtime API Examples", link: "/guide/api-example" },
                    ],
                },
                {
                    text: "Development",
                    link: "/development",
                    items: [
                        { text: "Best Practices", link: "/development/best-practices" },
                        { text: "Template System Architecture", link: "/development/template-system-architecture" },
                        { text: "Domain Scaffolding", link: "/development/domain-scaffolding" },
                        { text: "Testing Guide", link: "/development/testing-guide" },
                    ],
                },
                {
                    text: "Architecture",
                    link: "/architecture/",
                    items: [
                        { text: "Overview", link: "/architecture/" },
                        { text: "Plugin System", link: "/architecture/plugin-system" },
                        { text: "Architecture Decisions", link: "/architecture/architecture-decisions" },
                    ],
                },
                {
                    text: "DevOps",
                    link: "/devops/ci-cd-pipeline",
                    items: [
                        { text: "CI/CD Pipeline", link: "/devops/ci-cd-pipeline" },
                        { text: "Deployment Guide", link: "/devops/deployment" },
                        { text: "Process Manager", link: "/devops/process-manager-reference" },
                    ],
                },
            ],
            '/reference/': [
                {
                    text: "Reference",
                    link: "/reference/cache-actions-reference",
                    items: [
                        { text: "Cache Actions", link: "/reference/cache-actions-reference" },
                        { text: "Logs Actions", link: "/reference/logs-actions-reference" },
                        { text: "Messages & Events", link: "/reference/messages-actions-reference" },
                        { text: "i18n & Languages", link: "/reference/languages-i18n" },
                        { text: "Troubleshooting", link: "/reference/troubleshooting" },
                    ]
                }
            ]
        },

        socialLinks: [{ icon: "github", link: "https://github.com/rslucena/TypeScript-Boilerplate" }],
    },
});
