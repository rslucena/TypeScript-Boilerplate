import userRoutes from '@domain/user/routes'
import webserver from '@infrastructure/server/webserver'
;(async () => {
  const server = await webserver.create()
  server.register(userRoutes, { prefix: '/api/v1/users' })
  webserver.start(server)
})()
