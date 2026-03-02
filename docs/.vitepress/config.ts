import { defineConfig, type DefaultTheme } from "vitepress";
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { vitepressMermaidPreview } from 'vitepress-mermaid-preview';
import pkg from '../../package.json'

const version = process.env.VITE_APP_VERSION || pkg.version

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
    lang: 'en-US',
    title: "Boilerplate",
    description: "Blazing-fast TS Boilerplate featuring a Zero-Dep Template Engine, Auto-CRUD Scaffolding, i18n, and Smart Caching. Optimized for Bun. Experience the speed of Go with the familiarity of TypeScript.",
    themeConfig: {
        version,
        search: {
            provider: "local"
        },
        nav: [
            { text: "Home", link: "/" },
            { text: "Guide", link: "/guide/getting-started" },
            { text: "Reference", link: "/reference/cache-actions-reference" },
        ],
        sidebar: [
            {
                text: "🚀 Getting Started",
                items: [
                    { text: "Getting Started", link: "/guide/getting-started" },
                    { text: "Complete Example", link: "/guide/complete-example" },
                    { text: "Quick Navigation", link: "/guide/quick-navigation" },
                ],
            },
            {
                text: "API Reference & Usage",
                items: [
                    { text: "Introduction", link: "/api/introduction" },
                    { text: "Authentication", link: "/api/authentication" },
                    { text: "Error Handling", link: "/api/error-handling" },
                    { text: "Swagger & OpenAPI", link: "/api/swagger-openapi" },
                ]
            },
            {
                text: "🌐 Servers",
                items: [
                    { text: "HTTP/2", link: "/servers/http2" },
                    { text: "HTTP Server", link: "/servers/http-server" },
                    { text: "Scalable WebSockets", link: "/servers/websockets" },
                ]
            },
            {
                text: "🛠️ Development",
                items: [
                    { text: "Domain Scaffolding", link: "/development/domain-scaffolding" },
                    { text: "Template System", link: "/development/template-system-architecture" },
                    { text: "Testing Guide", link: "/development/testing-guide" },
                    { text: "Best Practices", link: "/development/best-practices" },
                ],
            },
            {
                text: "🏗️ Architecture",
                items: [
                    { text: "Overview", link: "/architecture/" },
                    { text: "Architecture Decisions", link: "/architecture/architecture-decisions" },
                    { text: "Identity vs Credentials", link: "/architecture/identity-vs-credentials" },
                    { text: "SSO Flow", link: "/architecture/sso-flow" },
                    { text: "Plugin System", link: "/architecture/plugin-system" },
                ],
            },
            {
                text: "🚀 DevOps",
                items: [
                    { text: "CI/CD Pipeline", link: "/devops/ci-cd-pipeline" },
                    { text: "Deployment Guide", link: "/devops/deployment" },
                    { text: "Process Manager", link: "/devops/process-manager-reference" },
                ],
            },
            {
                text: "📚 Reference",
                items: [
                    { text: "Cache Actions", link: "/reference/cache-actions-reference" },
                    { text: "Messages Actions", link: "/reference/messages-actions-reference" },
                    { text: "Logs Actions", link: "/reference/logs-actions-reference" },
                    { text: "Languages (i18n)", link: "/reference/languages-i18n" },
                    { text: "Troubleshooting", link: "/reference/troubleshooting" },
                ]
            }
        ],

        socialLinks: [{ icon: "github", link: "https://github.com/rslucena/TypeScript-Boilerplate" }],
    } as DefaultTheme.Config & { version?: string },
});
