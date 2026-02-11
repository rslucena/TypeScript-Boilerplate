enum types {
	PASSWORD = "PASSWORD",
	OIDC = "OIDC",
	API_KEY = "API_KEY",
	PASSKEY = "PASSKEY",
	SERVICE = "SERVICE",
}

enum providers {
	LOCAL = "LOCAL",
	GOOGLE = "GOOGLE",
	GITHUB = "GITHUB",
	INTERNAL_OIDC = "INTERNAL-OIDC",
}

export { types, providers };
