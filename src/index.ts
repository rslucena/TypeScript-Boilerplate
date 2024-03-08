import users from '@domain/users/routes'
import webserver from '@infrastructure/server/webserver'
;(async () => {
  const server = await webserver.create()
  server.register(users)
  webserver.start(server)
})()
