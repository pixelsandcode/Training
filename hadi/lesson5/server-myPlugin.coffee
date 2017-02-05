Path = require('path');
Hapi = require('hapi');
Hoek = require('hoek');
myNpm = require('lesson4npm')

server = new Hapi.Server();

server.connection
  port: 3030
  host: "localhost"


server.method
  name: 'sayHi'
  method: myNpm.sayHello
  options: {}



server.route
  method: "GET"
  path: "/hello/{name}"
  handler: (request, reply) ->
    reply(server.methods.sayHi(encodeURIComponent(request.params.name)))

server.register [
  require('inert')
  require('vision')
  { register: require('lout') }
], (err) ->


server.register
  register: require('lesson5plugin')
  options:
    message: 'Bye'

server.start (err) =>
  throw err if err
  console.log "Server running at #{server.info.uri} \n try /bye/{name}, /hello/{name} and see the results"
