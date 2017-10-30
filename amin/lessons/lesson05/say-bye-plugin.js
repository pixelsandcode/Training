'use strict'
const sayByePlugin =
  {
    register: function (server, options, next) {
      server.route([{
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
          reply('Greetings To Universe!!')
        }
      },{
        method: 'GET',
        path: '/hello',
        handler: function (request, reply) {
          reply('Hello World!')
        }
      },
        {
          method: 'GET',
          path: '/bye',
          handler: function (request, reply) {
            reply('Bye World!')
          }
        },
        {
          method: 'GET',
          path: '/bye/{name}',
          handler: function (request, reply) {
            request.params.name === undefined ?
              reply('Bye Stranger!') :
              reply(`Bye ${request.params.name}! :-D`)
          }
        }])

      next()
    }
  }

sayByePlugin.register.attributes = {
  name: 'say-bye-plugin',
  version: '1.0.0'
}

module.exports = sayByePlugin