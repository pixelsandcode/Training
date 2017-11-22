module.exports = (users) => {
  const handlers = require('./handlers')(users)
  return [
    {
      method: 'GET',
      path: '/',
      config: {
        handler: handlers.home,
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
      config: {
        handler: handlers.hello,
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
      config: {
        handler: handlers.sayHello,
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
      config: {
        handler: handlers.ping,
        auth: {
          mode: 'try'
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        description: 'Say Pong if logged in.',
        notes: 'Logging in is necessary!',
        tags: ['authentication', 'get', 'ping pong', 'cookies']
      }
    },
    {
      method: 'POST',
      path: '/login',
      config: {
        handler: handlers.login,
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
      config: {
        handler: handlers.logout,
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
  ]
}