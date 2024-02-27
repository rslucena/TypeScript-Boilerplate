const connection = {
  database: String(process.env.MYSQL_DATABASE),
  host: String(process.env.MYSQL_SERVER),
  password: process.env.MYSQL_PASSWORD,
  port: 3306,
  user: process.env.MYSQL_USER,
}

export default connection
