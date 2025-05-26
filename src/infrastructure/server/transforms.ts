function safeParse<t = unknown>(value: string) {
	try {
		return JSON.parse(value) as t;
	} catch (err) {
		return undefined;
	}
}

export { safeParse };
