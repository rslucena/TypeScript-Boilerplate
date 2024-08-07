import { messages } from '@infrastructure/messages/actions'
import pm2 from 'pm2'
import pm2Worker from './commands/pm2-worker'
import pm2Workspace from './commands/pm2-workspace'

const enginer = process.env.npm_lifecycle_event === 'dev' ? 'tsx' : 'node'
const worker = process.env.npm_config_worker ?? undefined
const activated = !worker ? false : true

pm2.connect(async function (err) {
  if (err) {
    console.error(err)
    process.exit(2)
  }

  const jobs = worker ? pm2Workspace.find((configs) => configs.name === worker) : pm2Workspace

  if (!jobs) {
    console.error(new Error('Unable to locate the script, provider, or container for execution.'))
    process.exit()
  }

  const workspace = Array.isArray(jobs) ? jobs : [jobs]

  const workers = Promise.all(
    workspace.map((worker) => pm2Worker.start(enginer, worker, activated))
  )

  workers.catch((err) => console.error(err))

  workers.then(async (workers: Array<any>) => {
    for (let i = 0; i < workers.length; i++) {
      const worker: pm2.Proc & { heartbeat: string } = workers[i]
      if (!worker.heartbeat) continue
      const updown = worker.status === 'online' ? 'up' : 'down'
      await fetch(`${worker.heartbeat}?status=${updown}`, {
        signal: AbortSignal.timeout(1000),
      }).catch(() => null)
    }
    pm2Worker.list(enginer)
  })

  messages.sub('workers:server:info', async (message: string) =>
    message.length ? pm2Worker.info(message, enginer) : undefined
  )

  messages.sub('workers:server:restart', async (message: string) =>
    message.length ? pm2Worker.restart(message) : undefined
  )
})
