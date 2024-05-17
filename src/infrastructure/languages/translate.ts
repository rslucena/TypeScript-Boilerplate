import * as fs from 'fs'
import path from 'path'

const paths = path.resolve('./src/infrastructure/languages')

export const Languages: { [key: string]: { [key: string]: string } } = {
  en: JSON.parse(fs.readFileSync(`${paths}/en.json`, 'utf8').toString()),
  es: JSON.parse(fs.readFileSync(`${paths}/es.json`, 'utf8').toString()),
  "pt-br": JSON.parse(fs.readFileSync(`${paths}/pt.json`, 'utf8').toString()),
}

export default function translate(text: string, language?: string): string {
  const Dictionary = Languages[language || 'en']
  if (!Dictionary) return Languages['en'][text] ?? text
  return Dictionary[text] ?? text
}
