module.exports = (server) => {
  const handlers = require('./handlers')(server)
  return [
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
        description: 'This is a hello page.',
        notes: 'This page gets "/hello/{name}" and says: "Hello {name}"',
        tags: ['get', 'home', 'hello', 'methods']
      }
    },
    {
      method: 'GET',
      path: '/{name}',
      config: {
        handler: handlers.helloPage,
        description: 'Loads a page which says "Hello {name}" in html.',
        notes: 'This page gets {name} and says: "Hello {name}" in new index.html page',
        tags: ['get', 'home', 'hello', 'html']
      }
    }
  ]
}