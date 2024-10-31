import { messages } from '@infrastructure/messages/actions'
import { spawn } from 'child_process'
import pm2 from 'pm2'
import pm2Commands from './pm2-commands'
import { worker } from './pm2-workspace'

const engineer = process.env.npm_lifecycle_event === 'dev' ? 'tsx' : 'node'
const abort = { signal: AbortSignal.timeout(1000) }

async function debug(jobs: worker[]) {
  for (let i = 0; i < jobs.length; i++) {
    const command = `tsx watch --env-file=.env -- ${jobs[i].tsx}`
    const child = spawn(command, { stdio: 'inherit', shell: true })
    const { stdout, stderr } = child
    child.on('message', (message) => console.debug(message))
    child.on('error', (error) => console.error('command error:', error))
    child.on('close', (code) => console.error(`command exited with code ${code}`))
    stdout?.on('data', (data) => console.debug(data))
    stderr?.on('data', (data) => console.debug(data))
  }
}

async function execute(jobs: worker[], force?: boolean) {
  pm2.connect(async function (err) {
    if (err) {
      console.error(err)
      process.exit()
    }
    if (!jobs.length) {
      console.log(new Error('Unable to locate the script, provider, or container for execution.'))
      process.exit()
    }

    const workers = Promise.all(jobs.map((job) => pm2Commands.start(engineer, job, force)))

    workers.catch((err) => console.error(err))

    workers.then(async (workers: Array<any>) => {
      for (let i = 0; i < workers.length; i++) {
        const worker: pm2.Proc & { heartbeat: string } = workers[i]
        if (!worker.heartbeat) continue
        const updown = worker.status === 'online' ? 'up' : 'down'
        await fetch(`${worker.heartbeat}?status=${updown}`, abort).catch(() => null)
      }
      pm2Commands.list(engineer)
    })

    await messages.sub('workers:server:info', async (message: string) =>
      pm2Commands.info(message, engineer)
    )

    await messages.sub('workers:server:restart', async (message: string) => pm2Commands.restart(message))
  })
}

export default { execute, debug }
