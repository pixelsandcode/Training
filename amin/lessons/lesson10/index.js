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

//Strategy to use cookies for authentication
server.auth.strategy('session', 'cookie', true, {
  password: 'RHN4541682C8A6952791RHNF3DC270E9',  //password-should-be-32-characters
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

let uuid = 1       // Use seq instead of proper unique identifiers for demo only

const users = {
  admin: {
    username: 'admin',
    password: 'admin',
    fullname: 'Amin Abbasi'
  }
}

server.route([
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        reply(`--Home Page--\n\nGreetings ${users.admin.fullname}! :-D`)
      } else {
        reply('--Home Page--\n\nGreetings stranger!\n\nYou should login!')
      }
    },
    config: {
      auth: {
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      description: 'This is a home page.',
      notes: 'Logging in is necessary!',
      tags: ['authentication', 'get', 'home', 'cookies']
    }
  },
  {
    method: 'GET',
    path: '/hello',
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        reply(`HELLO Page\n\nHello ${users.admin.fullname}! :-D`)
      } else {
        reply('HELLO Page\n\nHello stranger!\n\nYou should login!')
      }
    },
    config: {
      auth: {
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      description: 'This is a hello page.',
      notes: 'Logging in is necessary!',
      tags: ['authentication', 'get', 'hello', 'cookies']
    }
  },
  {
    method: 'GET',
    path: '/hello/{name}',
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        reply(`Hello ${request.params.name}! :-D`)
      } else {
        reply('Access denied! You must login!')
      }
    },
    config: {
      auth: {
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      description: 'Say hello to specific person if it logged in.',
      notes: 'Logging in is necessary!',
      tags: ['authentication', 'get', 'hello', 'cookies']
    }
  },
  {
    method: 'GET',
    path: '/ping',
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        reply('Pong!')
      } else {
        reply('I will say pong if login!')
      }
    },
    config: {
      auth: {
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      description: 'Say Pong if it logged in.',
      notes: 'Logging in is necessary!',
      tags: ['authentication', 'get', 'ping pong', 'cookies']
    }
  },
  {
    method: 'POST',
    path: '/login',
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        reply.redirect('/')
      }

      let message = ''
      let account = null

      if (!request.payload.username || !request.payload.password) {
        message = 'Missing username and/or password!'
      } else {
        account = () => {
          for (let i = 0; i < users.length; i++) {
            if (users[i].username == request.payload.username) {
              return users[i]
            }
          }
        }
        //console.log(account)
        account = users[request.payload.username]
        if (!account || (account.password != request.payload.password)) {
          message = 'Invalid username and/or password!'
        }
      }

      if (message) {
        reply(message)
      }

      const sid = String(++uuid)
      request.server.app.cache.set(sid, {account: account}, 0, (err) => {
        if (err) {
          reply(err)
        }

        request.cookieAuth.set({sid: sid})
        //console.log(account.fullname)
        reply(`you logged in. Hello ${users.admin.fullname}! :-D`)
      })
    },
    config: {
      auth: {
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      description: 'Login page',
      notes: 'Username and Password is required!',
      tags: ['authentication', 'post', 'login', 'cookies']
    }
  },
  {
    method: 'POST',
    path: '/logout',
    handler: (request, reply) => {
      request.cookieAuth.clear()
      reply.redirect('/')
    },
    config: {
      auth: {
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      description: 'Logout page',
      notes: 'Goodbye!!',
      tags: ['authentication', 'post', 'logout', 'cookies']
    }
  }
])

// Start the server
server.start((err) => {
  if (err)
    console.error(err.message)
  console.log('Server started at ', server.info.uri)
})