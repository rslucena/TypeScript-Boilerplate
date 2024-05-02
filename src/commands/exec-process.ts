import { spawn } from 'child_process'

const worker = process.env.npm_config_worker

if (!worker || worker.split('/').length <= 1) {
  const err = new Error('Unable to locate the script, provider, or container for execution.')
  console.log(err)
  process.exit()
}

const command = `tsx watch --env-file=.env -- ./src/${worker}.ts`

const child = spawn(command, { stdio: 'inherit', shell: true })

child.on('message', (message) => console.log(message))

child.on('error', (error) => console.error('command error:', error))

child.on('close', (code) => console.error(`command exited with code ${code}`))
