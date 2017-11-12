'use strict'

const Hapi = require('hapi')
const server = new Hapi.Server()
server.connection({host: 'localhost', port: 3000})

const Joi = require('joi')
const Promise = require('bluebird')
const jwt = require('jsonwebtoken')

const ES = require('elasticsearch')
const client = new ES.Client({host: 'localhost:9200'})

const Puffer = require('puffer')
const db = new Puffer({host: 'localhost', name: 'usersjwt'})
const ODME = require('odme')
const Model = ODME.CB({source: db})

class User extends Model {

  PREFIX() {
    return 'u'
  }

  props() {
    return {
      email: {
        schema: Joi.string(),
        whiteList: true
      },
      password: {
        schema: Joi.string(),
        whiteList: true
      },
      fullname: {
        schema: Joi.string(),
        whiteList: true
      },
      dob: {
        schema: Joi.string(),
        whiteList: true
      },
      weight: {
        schema: Joi.string(),
        whiteList: true
      },
      height: {
        schema: Joi.string(),
        whiteList: true
      }
    }
  }
}

class blockedTokens extends Model {

  PREFIX() {
    return 'jwt'
  }

  props() {
    return {
      token: {
        schema: Joi.string(),
        whiteList: true
      }
    }
  }
}

const signup = (request, reply) => {
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
  }, (err, response) => {
    if (err) {
      reply('There was a problem in finding email:\n\n', err)
    } else {
      //console.log(JSON.stringify(response, null, 2))
      if (response.hits.total == 0) {
        let user = new User({
          email: request.payload.email,
          password: request.payload.password,
          fullname: request.payload.fullname,
          dob: request.payload.dob,
          weight: request.payload.weight,
          height: request.payload.height
        })
        var docs = [user.create(true)]
        //console.log(user)
        // Promise.all(docs).then((err, res) => {
        //     if (err) {
        //       reply('There was a problem in promise:\n\n', err)
        //     } else {
        //       reply('Signed up successfully:\n\n', res)
        //     }
        //   }
        // )
        Promise.all(docs).then((res) => {
            reply(res)
          }
        )
      } else {
        reply('This email is already exists. Please use another email to sign-up.')
      }
    }
  })
}

const login = (request, reply) => {
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
  }, (err, response) => {
    if (err) {
      reply(`There was a problem. Please try again later:\n
      ${err}\n\n
      typeof(request.payload.email):
      ${typeof(request.payload.email)}, ${request.payload.email}\n\n
      typeof(request.payload.password): 
      ${typeof(request.payload.password)}, ${request.payload.password}`)

    } else {
      //console.log(response.hits.total)
      if (response.hits.total == 0) {
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
          //reply(`\ntoken: ${token}`)
        }
      }
    }
  })
}

const me = (request, reply) => {
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
        reply('<<Home Page>>\n\nHello, ', res.hits.hits[0]._source.doc)
      }
    })
  } else {
    reply('You need to login first!')
  }
}

const feed = (request, reply) => {
  if (request.auth.isAuthenticated) {
    //var decodedToken = request.auth.credentials
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
        console.error(err)
        reply('there was problem try again later.')
      } else {
        console.log(res)
        //var current_users_name = response.hits.hits[0]._source.doc.fullname
        console.log(res.hits.hits[0]._source.doc.fullname)
        reply(
          `[ { card: ‘menu’ }, { card: ‘profile’, name: 
          ${res.hits.hits[0]._source.doc.fullname} } ]`
        )
      }
    })
  } else {
    reply(`[{card: ‘menu’}, {card: ‘login’}]`)
  }
}

const logout = (request, reply) => {
  if (request.auth.isAuthenticated) {
    console.log(`request.auth.token: ${request.auth.token}`)
    //var token = request.auth.token
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

server.register(
  [
    require('hapi-auth-jwt2'),
    require('lout'),
    require('inert'),
    require('vision')
  ],
  (err) => {
    if (err)
      console.log(err)
  }
)

// bring your own validation function
const validate = (decoded, request, callback) => {
  // do your checks to see if the person is valid
  client.search({
    index: 'users_jwt',
    type: 'jwt',
    body: {
      query: {
        match: {
          "doc.token": request.auth.token
        }
      }
    }
  }, (err, response) => {
    if (err) {
      console.error(err)
      console.log('request.auth.token: ', request.auth.token)
    } else {
      console.log('request.auth.token: ', request.auth.token)
      if (response.hits.total == 0) {
        client.search({
          index: 'users_jwt',
          type: 'user',
          body: {
            query: {
              match: {
                "doc.email": decoded.email
              }
            }
          }
        }, (err, response) => {
          if (err) {
            console.error(err)
          } else {
            if (response.hits.total == 0) {
              callback(null, false)
            } else {
              console.log(`validated email : ${decoded.email}`)
              //callback: function(err, isValid, credentials)
              callback(null, true, request.auth.credentials)
            }
          }
        })
      } else {
        callback(null, false)
      }
    }
  })
}

const secret_key = 'amin4193'
server.auth.strategy('jwt', 'jwt', //true,   // "true": so JWT auth is required for all routes
  {
    key: secret_key,                           // Never Share your secret key
    validateFunc: validate,                // validate function defined above
    verifyOptions: {algorithms: ['HS256']} // pick a strong algorithm
  })
server.auth.default('jwt')

server.route([
  {
    method: 'GET',
    path: '/me',
    handler: me,
    config: {
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
    handler: feed,
    config: {
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
    handler: login,
    config: {
      auth: false, // don't require people to be logged in to see the login page! (duh!)
      description: 'Login page',
      notes: 'Email and Password is required!',
      tags: ['authentication', 'post', 'login', 'jwt']
    }
  },
  {
    method: 'POST',
    path: '/logout',
    handler: logout,
    config: {
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
    handler: signup,
    config: {
      auth: false, // don't require people to be logged in to see the sign-up page! (duh!)
      // auth: {
      //   strategy: 'jwt',
      //   mode: 'try'
      // },
      description: 'Sign-up page',
      notes: 'Needs email, password, name, height and weight.',
      tags: ['authentication', 'post', 'signup', 'jwt']
    }
  }
])

// Start the server
server.start((err) => {
  if (err)
    console.error(err.message)
  console.log('Server started at ', server.info.uri)
})