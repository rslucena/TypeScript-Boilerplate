import * as fs from "node:fs";
import path from "node:path";
import { safeParse } from "@infrastructure/server/transforms";

const paths = path.resolve("./src/infrastructure/languages");

export const Languages: { [key: string]: { [key: string]: string } } = {
	en: safeParse(fs.readFileSync(`${paths}/en.json`, "utf8").toString()) ?? {},
	es: safeParse(fs.readFileSync(`${paths}/es.json`, "utf8").toString()) ?? {},
	"pt-br": safeParse(fs.readFileSync(`${paths}/pt.json`, "utf8").toString()) ?? {},
};

export default function translate(text: string, language?: string): string {
	const Dictionary = Languages[language || "en"];
	if (!Dictionary) return Languages.en[text] ?? text;
	return Dictionary[text] ?? text;
}
