'use strict'
const sayByePlugin =
  {
    register: (server, options, next) => {
      const handlers = require('./handlers')()
      server.route([
        {
          method: 'GET',
          path: '/',
          config: {
            handler: handlers.home,
            description: 'This is a home page.',
            notes: 'This a global page.',
            tags: ['get', 'home', 'plugin']
          }
        },
        {
          method: 'GET',
          path: '/hello',
          config: {
            handler: handlers.hello,
            description: 'This is a hello page.',
            notes: 'This page says: "Hello World!"',
            tags: ['get', 'home', 'hello', 'plugin']
          }
        },
        {
          method: 'GET',
          path: '/bye',
          config: {
            handler: handlers.bye,
            description: 'This is a bye page.',
            notes: 'This page says: "Bye World!"',
            tags: ['get', 'home', 'bye', 'plugin']
          }
        },
        {
          method: 'GET',
          path: '/bye/{name}',
          config: {
            handler: handlers.sayBye,
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