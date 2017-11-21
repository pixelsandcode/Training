module.exports = () => {
  const npm = require('./say-hi-npm')
  return {
    home: (request, reply) => {
      reply('----- Home Page -----\n\nHello World! :-D')
    },
    helloStranger: (request, reply) => {
      reply('Hello Stranger! :-D')
    },
    sayHello: (request, reply) => {
      reply(npm.sayHi(request.params.name))
    }
  }
}