import { spawn } from 'child_process'
import pm2Workspace from './pm2-workspace'

const worker = process.env.npm_config_worker
const err = new Error('Unable to locate the script, provider, or container for execution.')

if (!worker) {
  console.log(err)
  process.exit()
}

const jobs = pm2Workspace.find((configs) => configs.name === worker)
if (!jobs) {
  console.log(err)
  process.exit()
}

const command = `tsx watch --env-file=.env -- ${jobs.tsx}`

const child = spawn(command, { stdio: 'inherit', shell: true })

child.on('message', (message) => console.log(message))

child.on('error', (error) => console.error('command error:', error))

child.on('close', (code) => console.error(`command exited with code ${code}`))
