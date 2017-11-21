'use strict'

const Hapi = require('hapi')
const server = new Hapi.Server()
server.connection({
  host: 'localhost',
  port: 3000
})

server.register(
  [
    require('./say-bye-plugin/say-bye-plugin'),
    require('vision'),
    require('inert'),
    require('lout')
  ],
  (err) => {
    if (err)
      console.log(err)
  })

require('./methods')(server)

server.route(require('./routes')(server))

server.start((err) => {
  if (err)
    throw err
  console.log('Server started at ', server.info.uri)
})