import isProd from '@infrastructure/settings/env'

const connection = {
  port: 3306,
  host: String(process.env.MYSQL_SERVER),
  password: String(process.env.MYSQL_PASSWORD),
  user: isProd() ? String(process.env.MYSQL_MAIN_USER) : String(process.env.MYSQL_SHADOW_USER),
  database: isProd()
    ? String(process.env.MYSQL_MAIN_DATABASE)
    : String(process.env.MYSQL_SHADOW_DATABASE),
}

export default connection
