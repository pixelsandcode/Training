'use strict'
const sayByePlugin =
  {
    register: (server, options, next) => {
      server.route([
        {
          method: 'GET',
          path: '/',
          handler: (request, reply) => {
            reply('Greetings To Universe!!')
          },
          config: { // Config for lout to have a good documentation!
            description: 'This is a home page.',
            notes: 'This a global page.',
            tags: ['get', 'home', 'plugin']
          }
        },
        {
          method: 'GET',
          path: '/hello',
          handler: (request, reply) => {
            reply('Hello World!')
          },
          config: {
            description: 'This is a hello page.',
            notes: 'This page says: "Hello World!"',
            tags: ['get', 'home', 'hello', 'plugin']
          }
        },
        {
          method: 'GET',
          path: '/bye',
          handler: (request, reply) => {
            reply('Bye World!')
          },
          config: {
            description: 'This is a bye page.',
            notes: 'This page says: "Bye World!"',
            tags: ['get', 'home', 'bye', 'plugin']
          }
        },
        {
          method: 'GET',
          path: '/bye/{name}',
          handler: (request, reply) => {
            request.params.name === undefined ?
              reply('Bye Stranger!') :
              reply(`Bye ${request.params.name}! :-D`)
          },
          config: {
            description: 'This is a bye page.',
            notes: 'This page says: "Bye NAME!" with a given ${name}.',
            tags: ['get', 'home', 'bye', 'plugin']
          }
        }
      ])

      next()
    }
  }

sayByePlugin.register.attributes = {
  name: 'say-bye-plugin',
  version: '1.0.0'
}

module.exports = sayByePlugin