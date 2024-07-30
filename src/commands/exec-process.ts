import Logs from '@infrastructure/logs/handler'
import { spawn } from 'child_process'
import pm2Workspace from './pm2-workspace'

const worker = process.env.npm_config_worker ?? undefined

const err = 'Unable to locate the script, provider, or container for execution.'

if (!worker) {
  Logs.console.warn(err)
  process.exit()
}

const jobs = pm2Workspace.find((configs) => configs.name === worker)
if (!jobs) {
  Logs.console.warn(err)
  process.exit()
}

const command = `tsx watch --env-file=.env -- ${jobs.tsx}`

const child = spawn(command, { stdio: 'inherit', shell: true })

child.on('message', (message) => console.warn(message))

child.on('error', (error) => {
  Logs.console.warn(`pid: ${child.pid}, command error`, error)
  process.exit()
})

child.on('close', (code) => {
  Logs.console.warn(`pid: ${child.pid}, command exited with code ${code}`)
  process.exit()
})
