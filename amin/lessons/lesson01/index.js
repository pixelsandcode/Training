const Hapi = require('hapi')

// Create a server with a host and port
const server = new Hapi.Server()
server.connection({
  host: 'localhost',
  port: 3000
})

function sayhi(name) {
  return 'Hello ' + name + '! :-D'
}

// Add the route
server.route({
  method: 'GET',
  path: '/hello/{name}',
  handler: function (request, reply) {
    reply(sayhi(request.params.name))
  }
})

// Start the server
server.start( function (err) {
  if (err)
    throw err
  console.log('Server started at ', server.info.uri)
})