'use strict';

const Hapi = require('hapi');
const Hello = require('say-hello-lesson4')
const server = new Hapi.Server();

server.connection({
  port: 8080,
  host: 'localhost'
})

server.register(
  [
    require('say-bye'),
    require('vision'),
    require('inert'),
    require('lout')
  ], (err) => {
    if (err)
      console.error(err)
  }
)

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply(`Hello to you my friend.`)
  },
  config: {
    description: 'Says hello to user at the start.',
    notes: 'usage : nothing. this is the home page.',
    tags: ['route', 'homepage', 'hello']
  }
})

server.method({
  name: 'sayhi',
  method: Hello.sayhello
})

server.route({
  method: 'GET',
  path: '/hello/{name}',
  handler: (request, reply) => {
    reply(
      server.methods.sayhi(
        encodeURIComponent(request.params.name)
      )
    )
  },
  config: {
    description: 'Says hello to user by the the plugin.',
    notes: 'usage : GET/hellp/{name}',
    tags: ['route', 'method', 'plugin']
  }
})

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri}`)
})
