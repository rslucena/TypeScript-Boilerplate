import { messages } from '@infrastructure/messages/actions'
import pm2 from 'pm2'
import pm2Commands from './pm2-commands'
import { worker } from './pm2-workspace'

const enginer = process.env.npm_lifecycle_event === 'dev' ? 'tsx' : 'node'
const worker = process.env.npm_config_worker ?? undefined
const abort = { signal: AbortSignal.timeout(1000) }

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

    const workers = Promise.all(jobs.map((job) => pm2Commands.start(enginer, job, force)))

    workers.catch((err) => console.error(err))

    workers.then(async (workers: Array<any>) => {
      for (let i = 0; i < workers.length; i++) {
        const worker: pm2.Proc & { heartbeat: string } = workers[i]
        if (!worker.heartbeat) continue
        const updown = worker.status === 'online' ? 'up' : 'down'
        await fetch(`${worker.heartbeat}?status=${updown}`, abort).catch(() => null)
      }
      pm2Commands.list(enginer)
    })

    messages.sub('workers:server:info', async (message: string) =>
      pm2Commands.info(message, enginer)
    )

    messages.sub('workers:server:restart', async (message: string) => pm2Commands.restart(message))
  })
}

export default { execute }
