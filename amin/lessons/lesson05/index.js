'use strict'

const Hapi = require('hapi')
const Hi = require('say-hi-npm')
const server = new Hapi.Server()

server.connection({
  host: 'localhost',
  port: 3000
})

server.register(require('./say-bye-plugin'))

server.method({
  name: 'sayHi',
  method: Hi.sayHi
})

server.route({
  method: 'GET',
  path: '/hello/{name}',
  handler: function (request, reply) {
    request.params.name === undefined ?
      reply('Hello Stranger!') :
      reply(server.methods.sayHi(request.params.name))
  }
})

// Start the server
server.start((err) => {
  if (err)
    throw err
  console.log('Server started at ', server.info.uri)
})