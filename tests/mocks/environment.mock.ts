import { mock } from "bun:test";
import { readFileSync as originalReadFileSync } from "node:fs";
import { generateRSAKeyPair } from "@infrastructure/pipes/crypto";

const { privateKey, publicKey } = generateRSAKeyPair();

const DEFAULT_TEST_ENV = {
	APP_HTTP2: false as boolean,
	APP_KEY: "./keys/private.pem",
	APP_CERT: "./keys/cert.pem",
	APP_FOLDER_KEY: "keys",
	APP_NAME: "Test App",
	APP_DESCRIPTION: "Test Description",
	APP_VERSION: "0.0.1",
	LOG_LEVEL: "error",
	REDIS_STACK: true as boolean,
	SHOW_LOG: false as boolean,
	SSO_GOOGLE_CLIENT_ID: "test-client-id" as string | undefined,
	SSO_GOOGLE_CLIENT_SECRET: "test-client-secret" as string | undefined,
	SSO_GOOGLE_REDIRECT_URI: "http://localhost/callback" as string | undefined,
	isTest: true,
	isDev: false,
	isBuild: false,
} as const;

type TestEnv = { [K in keyof typeof DEFAULT_TEST_ENV]: (typeof DEFAULT_TEST_ENV)[K] };

export const createEnvMock = (overrides: Partial<TestEnv> = {}) => ({
	env: { ...DEFAULT_TEST_ENV, ...overrides },
});

export const createMutableEnvMock = () => {
	const env: TestEnv = { ...DEFAULT_TEST_ENV };

	const reset = () => {
		(Object.keys(DEFAULT_TEST_ENV) as (keyof TestEnv)[]).forEach((key) => {
			(env as Record<string, unknown>)[key] = DEFAULT_TEST_ENV[key];
		});
	};

	return { env, reset };
};

export const fsMock = {
	readFileSync: mock((path: string, ...args: unknown[]) => {
		if (path.includes("private.pem")) return privateKey;
		if (path.includes("public.pem")) return publicKey;
		if (path.includes("metadata.json")) return JSON.stringify({ kid: "test-kid" });
		if (path.includes("cert.pem")) return "fake-cert";
		return originalReadFileSync(path, ...(args as [BufferEncoding]));
	}),
};
