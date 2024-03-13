const connection = {
  port: 5432,
  host: String(process.env.POSTGRES_SERVER),
  password: String(process.env.POSTGRES_PASSWORD),
  username: String(process.env.POSTGRES_USER),
  database: String(process.env.POSTGRES_DATABASE),
}

export default connection
