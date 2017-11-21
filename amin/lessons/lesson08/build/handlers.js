module.exports = {
  home: (request, reply) => {
    reply('Greetings To Universe!!')
  },
  hello: (request, reply) => {
    reply('Hello World!')
  },
  hi: (request, reply) => {
    reply('Hi World!')
  },
  sayHi: (request, reply) => {
    request.params.name == undefined ?
      reply('Hi Stranger!') :
      reply(`Hi ${request.params.name}! :-D`)
  }
}