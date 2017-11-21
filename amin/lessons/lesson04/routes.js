const handlers = require('./handlers')()

module.exports = [
  {
    method: 'GET',
    path: '/',
    config: {
      handler: handlers.home,
      description: 'This is a home page.',
      notes: 'This page gets {name} and says: "Hello {name}"',
      tags: ['get', 'home']
    }
  },
  {
    method: 'GET',
    path: '/hello',
    config: {
      handler: handlers.helloStranger,
      description: 'This is a hello page.',
      notes: 'This page says: "Hello Stranger!"',
      tags: ['get', 'home', 'hello']
    }
  },
  {
    method: 'GET',
    path: '/hello/{name}',
    config: {
      handler: handlers.sayHello,
      description: 'This is a hello page with npm.',
      notes: 'This page says: "Hello NAME!"',
      tags: ['get', 'home', 'hello', 'npm']
    }
  }
]