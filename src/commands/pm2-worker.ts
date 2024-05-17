import pm2 from 'pm2'
import { worker } from './pm2-workspace'

function format(args: any, eng: string) {
  return {
    engine: eng,
    pid: args.pid,
    name: args.name,
    status: args.pm2_env.status,
    trigger: `${args.monit.memory / 1024 / 1024}mb`,
    script: args.pm2_env.script ?? 'N/A',
  }
}

const list = (engine: 'tsx' | 'node') =>
  pm2.list((err, list) => {
    if (err) return console.error(err)
    console.table(list.map((worker: any) => format(worker, engine)))
  })

const start = (engine: 'tsx' | 'node', worker: worker) =>
  new Promise((resolve, reject) => {
    if (worker.activated) return resolve(null)
    pm2.start(
      {
        name: worker.name,
        script: worker[engine],
        args: '--update-env',
        interpreter_args: '--watch',
        ...worker.options,
      },
      (err, app) => (err ? reject(err) : resolve(app))
    )
  })

const info = (name: string | undefined, engine: string) =>
  pm2.list((err, list) => {
    if (err) return console.error(err)
    const worker = list.find((worker) => worker.name === name)
    if (!worker) return console.error('Unable to locate the worker.')
    console.table(format(worker, engine))
  })

const restart = (name: string | undefined) =>
  pm2.list((err, list) => {
    if (err) return console.error(err)
    const worker = list.find((worker) => worker.name === name)
    if (!worker) return console.error('Unable to locate the worker.')
    pm2.restart(worker.name as string, (err, app) => (err ? console.log(err) : console.table(app)))
  })

const find = (listprocess: pm2.ProcessDescription[], name: string | undefined) =>
  listprocess.find((el) => el.name === name)

export default { start, list, info, find, restart }
