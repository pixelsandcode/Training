#!/usr/bin/env node

'use strict';

const Hapi = require('hapi')
const server = new Hapi.Server

let uuid = 1

const users = {
  admin: {
    id: 'admin',
    password: 'admin',
    name: 'admin'
  }
}

const home = (request, reply) => {
  if (request.auth.isAuthenticated) {
    reply('Hello, ' + request.auth.credentials.name)
  } else {
    reply('you must login.')
  }
}

const login = (request, reply) => {

  if (request.auth.isAuthenticated) {
    reply.redirect('/')
  }

  let message = '';
  let account = null;


  if (!request.payload.username ||
    !request.payload.password) {

    message = 'Missing username or password';
  } else {
    account = users[request.payload.username];
    if (!account ||
      account.password !== request.payload.password) {

      message = 'Invalid username or password';
    }
  }

  if (message) {
    return reply(message)
  }

  const sid = String(++uuid);
  request.server.app.cache.set(sid, {
    account: account
  }, 0, (err) => {

    if (err) {
      reply(err);
    }

    request.cookieAuth.set({
      sid: sid
    });
    return reply('you loged in.')
  });
}

const ping = (request, reply) => {

  if (request.auth.isAuthenticated) {
    return reply(`PONG`)
  } else {
    return reply(`I will say pong if login.`)
  }

}

const sayhi = (request, reply) => {

  if (request.auth.isAuthenticated) {
    return reply(
      `Hello, ${request.auth.credentials.name} \n Hello, ${request.params.name}`
    )
  } else {
    return reply(`You must login to see this page.`)
  }

}

const logout = (request, reply) => {

  request.cookieAuth.clear();
  return reply('You loged out!');

}

server.connection({
  port: 8080,
  host: 'localhost'
})

server.register(
  [
    require('hapi-auth-cookie'),
    require('vision'),
    require('inert'),
    require('lout')
  ], (err) => {
    if (err)
      console.error(err)
  })

const cache = server.cache({
  segment: 'sessions',
  expiresIn: 3 * 24 * 60 * 60 * 1000
})

server.app.cache = cache

server.auth.strategy('session', 'cookie', true, {
  password: 'password-should-be-32-characters',
  cookie: 'sid-example',
  redirectTo: '/login',
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


server.route(
  [{
    method: 'GET',
    path: '/',
    config: {
      handler: home,
      auth: {
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      description: 'This is home page.',
      notes: 'usage: GET/',
      tags: ['home', 'route']
    }
  }, {
    method: 'POST',
    path: '/login',
    config: {
      handler: login,
      auth: {
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      description: 'This is login route.',
      notes: 'usage: POST/login with username and password',
      tags: ['login', 'route', 'cookie']
    }
  }, {
    method: 'GET',
    path: '/hello/{name}',
    config: {
      handler: sayhi,
      auth: {
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      description: 'Says hello if user is loged in.',
      notes: 'usage: GET/hello/{name}',
      tags: ['route', 'hello', 'logedin']
    }
  }, {
    method: 'GET',
    path: '/ping',
    config: {
      handler: ping,
      auth: {
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      description: 'ping request',
      notes: 'usage: GET/ping',
      tags: ['ping', 'route', 'logedin']
    }
  }, {
    method: 'POST',
    path: '/logout',
    config: {
      handler: logout,
      auth: {
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      description: 'login out',
      notes: 'usage: POST/logout',
      tags: ['logout', 'route', 'cookie']
    }
  }])

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Here you can see power of magic: ${server.info.uri}`);
})
