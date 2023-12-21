import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2'
import connection from './connection'

console.log(connection)
export default drizzle(mysql.createConnection(connection))
