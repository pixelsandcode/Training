const Hapi = require('hapi')
const sayHi = require('say-hi-npm')

// Create a server with a host and port
const server = new Hapi.Server()
server.connection({
  host: 'localhost',
  port: 3000
})

server.register([require('vision'), require('inert'), {register: require('lout')}], function (err) {
});

// Add the route
server.route({
  method: 'GET',
  path: '/hello/{name}',
  handler: function (request, reply) {
    reply(sayHi.sayHi(request.params.name))
  }
})

// Start the server
server.start(function (err) {
  if (err)
    throw err
  console.log('Server started at ', server.info.uri)
})