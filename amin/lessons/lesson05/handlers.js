module.exports = (server) => {
  return {
    sayHello: (request, reply) => {
      request.params.name === undefined ?
        reply('Hello Stranger!') :
        reply(server.methods.sayHi(request.params.name))
    }
  }
}