Path = require('path');
Hapi = require('hapi');
Hoek = require('hoek');

server = new Hapi.Server();

server.connection
  port: 3030
  host: "localhost"


server.method
  name: 'sayHi'
  method: (str) ->
    "Hello, #{str}"
  options: {}



server.route
  method: "GET"
  path: "/{name}"
  handler: (request, reply) ->
    reply(server.methods.sayHi(encodeURIComponent(request.params.name)))

server.register [
  require('inert')
  { register: require('lout') }
], (err) ->

server.register require('vision'), (err) ->
  Hoek.assert !err, err
  server.views
    engines: html: require('handlebars')
    relativeTo: __dirname
    path: './'
#layoutPath: './layout'
#layout: 'default'


server.route
  method: "GET"
  path: "/hello/{name}"
  handler: (request, reply) ->
    reply.view 'index', {message1: 'Hello', message2: encodeURIComponent(request.params.name)}

server.start (err) =>
  throw err if err
  console.log "Server running at #{server.info.uri} \n try /docs, /{name}, /hello/{name} and see the results"