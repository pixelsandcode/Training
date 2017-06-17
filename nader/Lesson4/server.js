'use strict';

const Hapi = require('hapi');
const hello = require('say-hello-lesson4')
const server = new Hapi.Server();
server.connection({
  port: 8080,
  host: 'localhost'
})
server.register(
  [require('vision'),
    require('inert'),
    require('lout')
  ], (err) => {
    if (err)
      console.error(err);
  }
)

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply(`Hello, to you my friend.`)
  },
  config: {
    description: 'Says hello at the start.',
    notes: 'usage : automated, homepage.',
    tags: ['hello', 'homepage', 'route']
  }
})

server.method({
  name: 'sayhi',
  method: hello.sayhello,
})

server.route({
  method: 'GET',
  path: '/hello/{name}',
  handler: (request, reply) => {
    reply(server.methods.sayhi(encodeURIComponent(request.params.name)))
  },
  config: {
    description: 'Says Hello to user by the specified address.',
    notes: 'usage : GET/hellp/{name}',
    tags: ['Hello', 'API', 'Hapijs', 'server routes']
  }
});

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri}`);
})
