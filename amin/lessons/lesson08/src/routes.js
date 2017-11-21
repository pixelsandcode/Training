module.exports = () => {
  const handlers = require('./handlers')
  return [
    {
      method: 'GET',
      path: '/',
      handler: handlers.home
    },
    {
      method: 'GET',
      path: '/hello',
      handler: handlers.hello
    },
    {
      method: 'GET',
      path: '/hi',
      handler: handlers.hi
    },
    {
      method: 'GET',
      path: '/hello/{name}',
      handler: handlers.sayHi
    }
  ]
}