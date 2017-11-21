module.exports = (server) => {
  const hi_npm = require('say-hi-npm')

  server.method({
    name: 'sayHi',
    method: hi_npm.sayHi
  })
}