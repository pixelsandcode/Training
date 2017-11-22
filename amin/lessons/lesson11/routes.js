module.exports = (client, User, blockedTokens, Promise, jwt, secret_key) => {
  const handlers = require('./handlers')(client, User, blockedTokens, Promise, jwt, secret_key)
  return [
    {
      method: 'GET',
      path: '/me',
      config: {
        handler: handlers.me,
        auth: {
          strategy: 'jwt',
          mode: 'try'
        },
        description: 'This is a home page.',
        notes: 'Logging in is necessary!',
        tags: ['authentication', 'get', 'home', 'jwt']
      }
    },
    {
      method: 'GET',
      path: '/feed',
      config: {
        handler: handlers.feed,
        auth: {
          strategy: 'jwt',
          mode: 'try'
        },
        description: 'Show feeds.',
        notes: 'Logging in is optional!',
        tags: ['authentication', 'get', 'feed', 'jwt']
      }
    },
    {
      method: 'POST',
      path: '/login',
      config: {
        handler: handlers.login,
        auth: false,
        description: 'Login page',
        notes: 'Email and Password is required!',
        tags: ['authentication', 'post', 'login', 'jwt']
      }
    },
    {
      method: 'POST',
      path: '/logout',
      config: {
        handler: handlers.logout,
        auth: {
          strategy: 'jwt',
          mode: 'try'
        },
        description: 'Logout page',
        notes: 'Goodbye!!',
        tags: ['authentication', 'post', 'logout', 'jwt']
      }
    },
    {
      method: 'POST',
      path: '/signup',
      config: {
        handler: handlers.signup,
        auth: false,
        description: 'Sign-up page',
        notes: 'Needs email, password, name, height and weight.',
        tags: ['authentication', 'post', 'signup', 'jwt']
      }
    }
  ]
}