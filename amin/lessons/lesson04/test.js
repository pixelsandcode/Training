const Hapi = require('hapi')
const sayHi = require('say-hi-npm')

// Create a server with a host and port
const server = new Hapi.Server()
server.connection({
  host: 'localhost',
  port: 3000
})

server.register(
  [
    require('vision'),
    require('inert'),
    require('lout')
  ],
  (err) => {
    if (err)
      console.log(err)
  })

// Add the route
server.route([
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply('----- Home Page -----\n\nHello World! :-D')
    },
    config: { // Config for lout to have a good documentation!
      description: 'This is a home page.',
      notes: 'This page gets {name} and says: "Hello {name}"',
      tags: ['get', 'home']
    }
  },
  {
    method: 'GET',
    path: '/hello',
    handler: (request, reply) => {
      reply('Hello Stranger! :-D')
    },
    config: {
      description: 'This is a hello page.',
      notes: 'This page says: "Hello Stranger!"',
      tags: ['get', 'home', 'hello']
    }
  },
  {
    method: 'GET',
    path: '/hello/{name}',
    handler: (request, reply) => {
      reply(sayHi.sayHi(request.params.name))
    },
    config: {
      description: 'This is a hello page with npm.',
      notes: 'This page says: "Hello NAME!"',
      tags: ['get', 'home', 'hello', 'npm']
    }
  }
])

// Start the server
server.start((err) => {
  if (!err)
  console.log('Server started at ', server.info.uri)
})