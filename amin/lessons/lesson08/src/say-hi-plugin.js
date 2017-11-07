'use strict'

const sayHiPlugin =
  {
    register: (server, options, next) => {
      server.route([
        {
          method: 'GET',
          path: '/',
          handler: (request, reply) => {
            reply('Greetings To Universe!!')
          }
        },
        {
          method: 'GET',
          path: '/hello',
          handler: (request, reply) => {
            reply('Hello World!')
          }
        },
        {
          method: 'GET',
          path: '/hi',
          handler: (request, reply) => {
            reply('Hi World!')
          }
        },
        {
          method: 'GET',
          path: '/hello/{name}',
          handler: (request, reply) => {
            request.params.name === undefined ?
              reply('Hi Stranger!') :
              reply(`Hi ${request.params.name}! :-D`)
          }
        }
      ])
      next()
    }
  }

sayHiPlugin.register.attributes = {
  name: 'say-hi-plugin',
  version: '1.0.0'
}

module.exports = sayHiPlugin