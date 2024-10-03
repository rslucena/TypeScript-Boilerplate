import pm2Workers from './pm2-workers'
import pm2Workspace from './pm2-workspace'

const enginer = process.env.npm_lifecycle_event
const worker = process.env.npm_config_worker ?? undefined
const group = process.env.npm_config_group ?? undefined
const err = new Error('Unable to locate the script, provider, or container for execution.')

if (!worker && !group) {
  console.error(err)
  process.exit()
}

const jobs = group
  ? pm2Workspace.filter((configs) => configs.group.includes(group))
  : pm2Workspace.filter((configs) => configs.name === worker)

if (!jobs.length) {
  console.error(err)
  process.exit()
}
enginer === 'dev'
  ? await pm2Workers.debug(jobs)
  : await pm2Workers.execute(jobs, worker ? true : false)
