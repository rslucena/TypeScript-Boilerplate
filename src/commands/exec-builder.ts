import fs from 'fs'
import path from 'path'
import { build, Options } from 'tsup'
import ts from 'typescript'
import pm2Workspace from './pm2-workspace'

const worker = process.env.npm_config_worker === 'all' ? undefined : process.env.npm_config_worker

const jobs = worker ? pm2Workspace.find((configs) => configs.name === worker) : pm2Workspace
if (!jobs) {
  console.error(new Error('Unable to locate the script, provider, or container for execution.'))
  process.exit()
}

const rootdir = process.cwd()
const tsPath = path.resolve(rootdir, 'tsconfig.json')

const config = ts.readConfigFile(tsPath, ts.sys.readFile).config
const commandline = ts.parseJsonConfigFileContent(
  config,
  {
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    useCaseSensitiveFileNames: true,
  },
  path.dirname(tsPath)
)

const programTS = ts.createProgram(commandline.fileNames, commandline.options)
const crossdependency = new Set<string>()
const processedFiles = new Set<string>()
const excludes: string[] = config.exclude.map((v: string) => v.replace('/**', ''))
const outers = new Set<string>()

const execution = path.resolve(rootdir, './src/workers.ts')
dependencies(execution)
crossdependency.add(execution)

const workspace = Array.isArray(jobs) ? jobs : [jobs]

for (let i = 0; i < workspace.length; i++) {
  const job = path.resolve(rootdir, workspace[i].tsx)
  dependencies(job)
  crossdependency.add(job)
}

if (!crossdependency.size) {
  console.error(new Error('Unable to locate the script, provider, or container for execution.'))
  process.exit()
}

function dependencies(entry: string) {
  const directory = path.dirname(entry)
  const files = fs.readdirSync(directory)
  for (const file of files) {
    const fullPath = path.join(directory, file)
    const stat = fs.statSync(fullPath)
    if (stat.isFile() && path.extname(file) !== '.ts') outers.add(fullPath)
  }
  const exclude = excludes.some((term) => entry.includes(term.toString()))
  if (exclude) return
  if (processedFiles.has(entry)) return
  processedFiles.add(entry)
  const source = programTS.getSourceFile(entry)
  if (!source) throw new Error('File not found')
  source.forEachChild((node) => nodes(node, source))
}

function nodes(node: ts.Node, source: ts.SourceFile) {
  const imports = ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
  if (!imports) return
  const specifier = node.moduleSpecifier
  if (!specifier || !ts.isStringLiteral(specifier)) return
  const moduleName = specifier.text
  const resolve = ts.resolveModuleName(moduleName, source.fileName, commandline.options, ts.sys)
  if (!resolve.resolvedModule) return
  const resolvedFileName = resolve.resolvedModule.resolvedFileName
  const exclude = excludes.some((term) => resolvedFileName.includes(term.toString()))
  if (exclude) return
  crossdependency.add(resolvedFileName)
  dependencies(resolvedFileName)
}

async function execute(dependency: string[]) {
  const tsupConfig: Options = {
    format: ['esm'],
    entry: dependency,
    tsconfig: tsPath,
    dts: false,
    clean: true,
    bundle: true,
    minify: true,
    outDir: 'dist',
    metafile: true,
    splitting: false,
    platform: 'node',
    sourcemap: false,
    minifySyntax: true,
    minifyWhitespace: true,
    minifyIdentifiers: true,
    env: { NODE_ENV: 'production' },
  }
  await build(tsupConfig)
    .then(async () => await saveouthers(Array.from(outers)))
    .catch((err) => console.error(err))
    .finally(() => process.exit())
}

async function saveouthers(files: string[]) {
  for (let i = 0; i < files.length; i++) {
    const paths = files[i].replace('/src/', '/dist/')
    const content = fs.readFileSync(files[i], 'utf-8')
    fs.writeFileSync(paths, content)
  }
}

await execute(Array.from(crossdependency))
