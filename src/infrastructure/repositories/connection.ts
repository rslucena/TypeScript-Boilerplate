import isProd from '@infrastructure/settings/env'

const connection = {
  port: 3306,
  host: String(process.env.MYSQL_SERVER),
  password: String(process.env.MYSQL_PASSWORD),
  user: isProd() ? String(process.env.MYSQL_USER) : 'shadow',
  database: isProd() ? String(process.env.MYSQL_DATABASE) : 'shadow',
}

export default connection
