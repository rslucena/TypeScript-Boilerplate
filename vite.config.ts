import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import { configDefaults } from "vitest/config";

export default ({ mode }: { mode: string }) => {
	process.env = { ...process.env, ...loadEnv(mode, process.cwd(), "VITE_") };
	for (const [key, value] of Object.entries(process.env)) {
		const reff = key.replace(/^VITE_/, "");
		if (!value || !key.startsWith("VITE_")) {
			delete process.env[key];
		} else {
			process.env[reff] = value;
		}
	}
	return defineConfig({
		test: {
			globals: false,
			environment: "node",
			exclude: [...configDefaults.exclude, ".docker/**"],
		},
		define: {
			"process.env": process.env,
		},
		resolve: {
			alias: [
				{
					find: "@domain",
					replacement: resolve(__dirname, "./src/domain"),
				},
				{
					find: "@infrastructure",
					replacement: resolve(__dirname, "./src/infrastructure"),
				},
			],
		},
	});
};
