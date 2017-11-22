'use strict'

const Hapi = require('hapi')
const server = new Hapi.Server()
server.connection({host: 'localhost', port: 3000})

server.register(
  [
    require('hapi-auth-cookie'),
    require('lout'),
    require('inert'),
    require('vision')
  ],
  (err) => {
    if (err)
      console.log(err)
  }
)

const cache = server.cache({
  segment: 'sessions',
  expiresIn: 3 * 24 * 60 * 60 * 1000
})

server.app.cache = cache

server.auth.strategy('session', 'cookie', true, {
  password: 'RHN4541682C8A6952791RHNF3DC270E9',
  cookie: 'sid-example',
  isSecure: false,
  validateFunc: (request, session, callback) => {
    cache.get(session.sid, (err, cached) => {
      if (err) {
        return callback(err, false)
      }

      if (!cached) {
        return callback(null, false)
      }

      return callback(null, true, cached.account)
    })
  }
})

const users = {
  admin: {
    username: 'admin',
    password: 'admin',
    fullname: 'Amin Abbasi'
  }
}

server.route(require('./routes')(users))

server.start((err) => {
  if (err)
    console.error(err.message)
  console.log('Server started at ', server.info.uri)
})