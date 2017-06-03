'use strict';

const Path = require('path')
const Hapi = require('hapi')
const Hoek = require('hoek')

const server = new Hapi.Server();
server.connection({
  port: 8080,
  host: 'localhost'
})

server.register(
  [
    require('vision'),
    require('inert'),
    require('lout')
  ], (err) => {
    Hoek.assert(!err, err)

    server.views({
      engines: {
        html: require('handlebars')
      },
      relativeTo: __dirname,
      path: './'

    });
  }
)

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply("Hello to you my friend.")
  },
  config: {
    description: 'At the start says hello to user.',
    notes: 'usage : this is the home page.',
    tags: ['hello', 'startpage', 'route']
  }
})

const sayhi = function(request, next) {
  next(`Hello, ${encodeURIComponent(request.params.name)} .`);
}

server.method({
  name: 'sayhi',
  method: sayhi,
})

server.route({
  method: 'GET',
  path: '/hello/{name}',
  handler: server.methods.sayhi,
  config: {
    description: 'Says Hello to user by the specified address.',
    notes: 'usage : GET/hellp/{name}',
    tags: ['route', 'method']
  }
})

server.route({
  method: 'GET',
  path: '/{name}',
  handler: (request, reply) => {
    reply.view('index.html', {
      hello: 'Hello, ',
      name: `${encodeURIComponent(request.params.name)}.`
    })
  },
  config: {
    description: 'Says hello to user by the loading html file.',
    notes: 'usage : GET/{name}',
    tags: ['view', 'route', 'html']
  }
})

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri}`);
})
