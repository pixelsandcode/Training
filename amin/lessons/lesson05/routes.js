module.exports = (server) => {
  const handlers = require('./handlers')(server)
  return [
    {
      method: 'GET',
      path: '/hello/{name}',
      config: {
        handler: handlers.sayHello,
        description: 'This is a hello page.',
        notes: 'This page says: "Hello NAME!" with a given ${name}.',
        tags: ['get', 'home', 'hello', 'plugin']
      }
    }
  ]
}