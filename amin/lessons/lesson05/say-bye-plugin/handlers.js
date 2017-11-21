module.exports = () => {
  return {
    home: (request, reply) => {
      reply('Greetings To Universe!!')
    },
    hello: (request, reply) => {
      reply('Hello World!')
    },
    bye: (request, reply) => {
      reply('Bye World!')
    },
    sayBye: (request, reply) => {
      request.params.name == undefined ?
        reply('Bye Stranger!') :
        reply(`Bye ${request.params.name}! :-D`)
    }
  }
}