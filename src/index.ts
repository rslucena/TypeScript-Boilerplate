import webserver from '@infrastructure/server/webserver'
;(async () => {
  const server = await webserver.create()
  webserver.start(server)
})()
