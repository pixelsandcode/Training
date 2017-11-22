module.exports = (users) => {
  return {
    home: (request, reply) => {
      if (request.auth.isAuthenticated) {
        reply(`--Home Page--\n\nGreetings ${users.admin.fullname}! :-D`)
      } else {
        reply('--Home Page--\n\nGreetings stranger!\n\nYou should login!')
      }
    },
    hello: (request, reply) => {
      if (request.auth.isAuthenticated) {
        reply(`HELLO Page\n\nHello ${users.admin.fullname}! :-D`)
      } else {
        reply('HELLO Page\n\nHello stranger!\n\nYou should login!')
      }
    },
    sayHello: (request, reply) => {
      if (request.auth.isAuthenticated) {
        reply(`Hello ${request.params.name}! :-D`)
      } else {
        reply('Access denied! You must login!')
      }
    },
    ping: (request, reply) => {
      if (request.auth.isAuthenticated) {
        reply('pong')
      } else {
        reply('I will say pong if login')
      }
    },
    login: (request, reply) => {
      if (request.auth.isAuthenticated) {
        reply.redirect('/')
      }

      let uuid = 1
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
    logout: (request, reply) => {
      request.cookieAuth.clear()
      reply.redirect('/')
    }
  }
}