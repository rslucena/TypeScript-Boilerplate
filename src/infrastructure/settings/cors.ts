import { FastifyCorsOptions } from '@fastify/cors'

export default <FastifyCorsOptions>{
  credentials: true,
  maxAge: 2 * 60 * 60,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Authorization'],
  origin: process.env.APP_CORS_ORIGIN,
  exposedHeaders: ['set-cookie', 'Authorization'],
}
