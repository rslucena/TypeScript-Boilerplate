import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2'
import connection from './connection'

export default drizzle(mysql.createConnection(connection))
