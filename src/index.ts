import userRoutes from '@domain/users/routes'
import webserver from '@infrastructure/server/webserver'
;(async () => {
  const server = await webserver.create()
  server.register(userRoutes, { prefix: 'user' })
  webserver.start(server)
})()
