'use strict'

const Hapi = require('hapi')
const Hi = require('say-hi-npm')
const server = new Hapi.Server()

server.connection({
  host: 'localhost',
  port: 3000
})

server.register(
  [
    require('./say-bye-plugin'),
    require('vision'),
    require('inert'),
    require('lout')
  ],
  (err) => {
    if (err)
      console.log(err)
  })

server.method({
  name: 'sayHi',
  method: Hi.sayHi
})

server.route({
  method: 'GET',
  path: '/hello/{name}',
  handler: (request, reply) => {
    request.params.name === undefined ?
      reply('Hello Stranger!') :
      reply(server.methods.sayHi(request.params.name))
  },
  config: {
    description: 'This is a hello page.',
    notes: 'This page says: "Hello NAME!" with a given ${name}.',
    tags: ['get', 'home', 'hello', 'plugin']
  }
})

// Start the server
server.start((err) => {
  if (err)
    throw err
  console.log('Server started at ', server.info.uri)
})