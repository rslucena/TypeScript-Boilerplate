import { messages } from '@infrastructure/messages/actions'
import pm2 from 'pm2'
import pm2Worker from './commands/pm2-worker'
import pm2Workspace from './commands/pm2-workspace'
const enginer = process.env.npm_lifecycle_event === 'workers' ? 'tsx' : 'node'

pm2.connect(async function (err) {
  if (err) {
    console.error(err)
    process.exit(2)
  }
  const workers = Promise.all(pm2Workspace.map((worker) => pm2Worker.start(enginer, worker)))
  workers.catch((err) => console.log(err))
  workers.then(() => pm2Worker.list(enginer))
  messages.sub('workers:server:info', async (message: string) =>
    message.length ? pm2Worker.info(message, enginer) : undefined
  )
  messages.sub('workers:server:restart', async (message: string) =>
    message.length ? pm2Worker.restart(message, enginer) : undefined
  )
})
