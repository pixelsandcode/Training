'use strict';

const Hapi = require('hapi');
const hello = require('sayhello.lesson4')
const server = new Hapi.Server();
server.connection({port: 8080, host: 'localhost'});
server.register([require('vision'), require('inert'), {register: require('lout') } ],function(err) {
  if(err){ console.log(err);}
});
server.register(require('say.bye.plugin'),(err) => {
  if (err) {
    console.error('Failed to load plugin: ', err);
    }
  } );
server.method({
 name: 'sayhi',
method: hello.sayhello,
});
server.route({
 method: 'GET' ,
 path: '/hello/{name}',
 handler: (request, reply) => {
   reply(server.methods.sayhi( encodeURIComponent(request.params.name) ) )
 },
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
