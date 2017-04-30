 'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({port: 8080, host: 'localhost'});
server.register([require('vision'), require('inert'), {register: require('lout') }],function(err) {
});
const sayhi = function (request, next) {
  next('Hello ' + encodeURIComponent(request.params.name));
}
server.method({
  name: 'sayhi',
 method: sayhi,
});
server.route({
  method: 'GET' ,
  path: '/hello/{name}',
  handler: server.methods.sayhi,
  config: {
    description: 'Says Hello to user by the address bar',
    notes: 'usage : GET/hellp/{name}',
    tags: ['Hello', 'API', 'Hapijs', 'server routes']
  }
});
server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}` );
});
