module.exports = (client, User, blockedTokens, Promise, jwt, secret_key) => {
  return {
    signup: (request, reply) => {
      client.search({
        index: 'users_jwt',
        type: 'user',
        body: {
          query: {
            match: {
              "doc.email": request.payload.email
            }
          }
        }
      }, (err, res) => {
        if (err) {
          reply('There was a problem in finding email:\n\n', err)
        } else {
          if (res.hits.total == 0) {
            let user = new User({
              email: request.payload.email,
              password: request.payload.password,
              fullname: request.payload.fullname,
              dob: request.payload.dob,
              weight: request.payload.weight,
              height: request.payload.height
            })
            let docs = [user.create(true)]
            Promise.all(docs).then((res) => {
                reply(res)
              }
            )
          } else {
            reply('This email is already exists. Please use another email to sign-up.')
          }
        }
      })
    },
    login: (request, reply) => {
      client.search({
        index: 'users_jwt',
        type: 'user',
        body: {
          query: {
            bool: {
              must: [
                {
                  match: {
                    "doc.email": request.payload.email
                  }
                },
                {
                  match: {
                    "doc.password": request.payload.password
                  }
                }]
            }
          }
        }
      }, (err, res) => {
        if (err) {
          reply(`There was a problem. Please try again later:\n${err}`)
        } else {
          if (res.hits.total == 0) {
            reply('Username and/or password are invalid.')
          } else {
            if (request.auth.isAuthenticated) {
              reply('You are already logged in!').header('Authorization',
                request.auth.authorization)
            } else {
              const obj = {email: request.payload.email}
              const token = jwt.sign(obj, secret_key)
              reply({
                text: 'You logged in!',
                jwtTonken: token
              }).header('Authorization', token)
            }
          }
        }
      })
    },
    me: (request, reply) => {
      if (request.auth.isAuthenticated) {
        const decodedToken = request.auth.credentials
        console.log(decodedToken.email)
        client.search({
          index: 'users_jwt',
          type: 'user',
          body: {
            query: {
              match: {
                "doc.email": request.auth.credentials.email
              }
            }
          }
        }, (err, res) => {
          if (err) {
            reply('There was problem. Please try again later.\n', err)
          } else {
            reply(`---Home Page---\n\nHello, ${res.hits.hits[0]._source.doc.fullname}!`)
          }
        })
      } else {
        reply('You need to login first!')
      }
    },
    feed: (request, reply) => {
      if (request.auth.isAuthenticated) {
        client.search({
          index: 'users_jwt',
          type: 'user',
          body: {
            query: {
              match: {
                "doc.email": request.auth.credentials.email
              }
            }
          }
        }, (err, res) => {
          if (err) {
            reply('There was a problem, please try again later.\n', err)
          } else {
            const full_name = res.hits.hits[0]._source.doc.fullname
            reply(`[ {card: ‘menu’}, {card: ‘profile’, name: ‘${full_name}‘} ]`
            )
          }
        })
      } else {
        reply(`[ {card: ‘menu’}, {card: ‘login’} ]`)
      }
    },
    logout: (request, reply) => {
      if (request.auth.isAuthenticated) {
        const blockthis = new blockedTokens({
          token: request.auth.token
        })
        blockthis.create(true).then((res) => {
            reply(`You logged out successfully!\n\n${JSON.stringify(res, null, 2)}`)
          }
        )
      } else {
        reply('You must login first.')
      }
    }
  }
}