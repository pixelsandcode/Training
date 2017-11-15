const Hapi = require('hapi')

// Create a server with a host and port
const server = new Hapi.Server()
server.connection({
  host: 'localhost',
  port: 3000
})

// Handler function of route 'GET'
const sayhi = function (request, reply) {
  reply(`Hello ${request.params.name}! :-D`)
}

// Server method for sayhi function
server.method({
  name: 'sayhi',
  method: sayhi,
})

server.register([require('vision'), require('inert'), {register: require('lout')}], function (err) {
  if (err)
    console.log(err)
})

// Server views to add and access index.html
server.views({
  engines: {
    html: require('handlebars')
  },
  path: 'hi-path'
})

// Add routes
server.route([
  {
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
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
    handler: function (request, reply) {
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
    handler: server.methods.sayhi,
    config: {
      description: 'This is a hello page.',
      notes: 'This page gets "/hello/{name}" and says: "Hello {name}"',
      tags: ['get', 'home', 'hello', 'methods']
    }
  },
  {
    method: 'GET',
    path: '/{name}',
    handler: (request, reply) => {
      reply.view('index', {
        title: 'Hello',
        message: `Hello ${request.params.name}!`
      })
    },
    config: {
      description: 'Loads a page which says "Hello {name}" in html.',
      notes: 'This page gets {name} and says: "Hello {name}" in new index.html page',
      tags: ['get', 'home', 'hello', 'html']
    }
  }
])

// Start the server
server.start(function (err) {
  if (err)
    throw err
  console.log('Server started at ', server.info.uri)
})