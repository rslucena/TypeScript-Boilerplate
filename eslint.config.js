export default [
	{
		files: ["*.{ts,tsx}"],
		env: {
			es2022: true,
			node: true,
		},
		rules: {
			semi: "error",
			"no-unused-vars": "warn",
			"no-undef": "warn",
		},
		languageOptions: {
			globals: true,
			ecmaVersion: "latest",
			parse: "@typescript-eslint/parser",
		},
		extends: [
			"eslint:recommended",
			"plugin:@typescript-eslint/eslint-recommended",
			"plugin:@typescript-eslint/recommended",
			"prettier",
			"plugin:drizzle/recommended",
		],
		plugins: ["drizzle", "@typescript-eslint", "prettier"],
		ignores: ["!node_modules/", "!.git/", "!.docker/", "!.vscode/", "!dist/", "!tests/"],
	},
];
