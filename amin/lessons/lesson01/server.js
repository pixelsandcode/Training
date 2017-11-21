const Hapi = require('hapi')

const server = new Hapi.Server()
server.connection({
  host: 'localhost',
  port: 3000
})

require('./methods')(server)

server.register(
  [
    require('vision'),
    require('inert'),
    require('lout')
  ],
  (err) => {
    if (err)
      console.log(err)
  })

server.views({
  engines: {
    html: require('handlebars')
  },
  path: 'hi-path'
})

server.route(require('./routes')(server))

server.start((err) => {
  if (err)
    throw err
  console.log('Server started at ', server.info.uri)
})