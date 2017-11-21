module.exports = (server) => {
  return {
    home: (request, reply) => {
      reply('----- Home Page -----\n\nHello World! :-D')
    },
    helloStranger: (request, reply) => {
      reply('Hello Stranger! :-D')
    },
    sayHello: (request, reply) => {
      reply(server.methods.sayhi(request.params.name))
    },
    helloPage: (request, reply) => {
      reply.view('index', {
        title: 'Hello Page',
        message: `Hello ${request.params.name}!`
      })
    }
  }
}