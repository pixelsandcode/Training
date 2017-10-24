const Hapi = require('hapi')

// Create a server with a host and port
const server = new Hapi.Server()
server.connection({
  host: 'localhost',
  port: 3000
})

// Add the route
server.route({
  method: 'GET',
  path: '/hello/{name}',
  handler: function (request, reply) {
    reply('Hello ' + request.params.name + '! :-D')
  }
})

// Start the server
server.start( function (err) {
  if (err)
    throw err
  console.log('Server started at ', server.info.uri)
})