#!/usr/bin/env node

'use strict';

const Hapi = require('hapi')
const jwt = require('jsonwebtoken')
const server = new Hapi.Server
const es = require('elasticsearch')
const client = new es.Client({
  host: 'localhost:9200',
  log: 'trace'
})
const db = new require('puffer')({
  host: 'localhost',
  name: 'default'
})
const Base = require('odme').CB({
  source: db
})
const Joi = require('joi')
const Promise = require('bluebird')

class User extends Base {
  PREFIX() {
    return 'user'
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


class blockedTokens extends Base {
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

const secret = 'pixelsandcode'
var validate = (decoded, request, callback) => {
  client.search({
    index: 'jwt-user',
    type: 'jwt',
    body: {
      query: {
        match: {
          "doc.token": request.auth.token
        }
      }
    }
  }, (error, response) => {
    if (error) {
      console.error(error)
      console.log(request.auth.token)
    } else {
      if (response.hits.total == 0) {
        client.search({
          index: 'jwt-user',
          type: 'user',
          body: {
            query: {
              match: {
                "doc.email": decoded.email
              }
            }
          }
        }, (error, response) => {
          if (error) {
            console.error(error)
          } else {
            if (response.hits.total == 0) {
              callback(null, false)
            } else {
              console.log(`validated email : ${decoded.email}`)
              callback(null, true)
            }
          }
        })
      } else {
        callback(null, false)
      }
    }
  })

}

const signup = (request, reply) => {
  client.search({
    index: 'jwt-user',
    type: 'user',
    body: {
      query: {
        match: {
          "doc.email": request.payload.email
        }
      }
    }
  }, (error, response) => {
    if (error) {
      console.error(error)
      reply('there was a problem please try again')
    } else {
      if (response.hits.total == 0) {
        let user = new User({
          email: request.payload.email,
          password: request.payload.password,
          fullname: request.payload.fullname,
          dob: request.payload.dob,
          weight: request.payload.weight,
          height: request.payload.height
        })
        var doc1 = user.create(true)
        var docs = [doc1]
        Promise.all(docs).then(
          (d) => {
            console.log(d)
            reply('signed up successfully.')
          }
        )
      } else {
        reply('email exists.')
      }
    }
  })
}

const login = (request, reply) => {
  client.search({
    index: 'jwt-user',
    type: 'user',
    body: {
      query: {
        bool: {
          must: [{
            match: {
              "doc.email": request.payload.email
            }
          }, {
            match: {
              "doc.password": request.payload.password
            }
          }]
        }
      }
    }
  }, (error, response) => {
    if (error) {
      console.error(error)
      console.log(
        `typeof(request.payload.email): ${typeof(request.payload.email)},${request.payload.email}`
      )
      console.log(
        `typeof(request.payload.password): ${typeof(request.payload.password)},${request.payload.password}`
      )
      reply('there was a problem please try again later')
    } else {
      if (response.hits.total == 0) {
        reply(`Invalid username or password.`)
      } else {
        if (request.auth.isAuthenticated) {
          reply('you are already logedin!').header('Authorization',
            request.auth.authorization)
        } else {
          var obj = {
            email: request.payload.email
          }
          var token = jwt.sign(obj, secret)
          reply({
            text: 'you logedin!',
            jwtTonken: token
          }).header('Authorization', token)
          console.log(`token: ${token}`)
        }
      }
    }
  })
}

const me = (request, reply) => {
  if (request.auth.isAuthenticated) {
    var decodedToken = request.auth.credentials
    var tokenEmail = decodedToken.email
    console.log(tokenEmail)
    client.search({
      index: 'jwt-user',
      type: 'user',
      body: {
        query: {
          match: {
            "doc.email": tokenEmail
          }
        }
      }
    }, (error, response) => {
      if (error) {
        console.error(error)
        reply('there was problem try again later.')
      } else {
        console.log(response)
        reply(response.hits.hits[0]._source.doc)
      }
    })
  } else {
    reply('you need to login first!')
  }
}

const feed = (request, reply) => {
  if (request.auth.isAuthenticated) {
    var decodedToken = request.auth.credentials
    var tokenEmail = decodedToken.email
    client.search({
      index: 'jwt-user',
      type: 'user',
      body: {
        query: {
          match: {
            "doc.email": tokenEmail
          }
        }
      }
    }, (error, response) => {
      if (error) {
        console.error(error)
        reply('there was problem try again later.')
      } else {
        console.log(response)
        var current_logged_in_users_name = response.hits.hits[0]._source
          .doc
          .fullname
        console.log(current_logged_in_users_name)
        reply(
          `[ { card: ‘menu’ }, { card: ‘profile’, name: ${current_logged_in_users_name} } ]`
        )
      }
    })
  } else {
    reply(`[{card: ‘menu’}, {card: ‘login’}]`)
  }
}

const logout = (request, reply) => {
  if (request.auth.isAuthenticated) {
    var token = request.auth.token
    var blockthis = new blockedTokens({
      token: token
    })
    blockthis.create(true).then(
      (d) => {
        console.log(typeof(request.auth.token))
        console.log(d)
        reply('loged out successfully.')
      }
    )
    console.log(`request.auth.token: ${request.auth.token}`)
  } else {
    reply('you must login first.')
  }
}

server.connection({
  host: 'localhost',
  port: 8080
})

server.register([require('hapi-auth-jwt2'), require('vision'), require(
    'inert'),
  require('lout')
], (err) => {
  if (err) console.error(err)
})

server.auth.strategy('jwt', 'jwt', {
  key: secret,
  validateFunc: validate,
  verifyOptions: {
    algorithms: ['HS256']
  }
})

server.auth.default('jwt')

server.route(
  [
    {
      method: 'POST',
      path: '/signup',
      config: {
        auth: {
          strategy: 'jwt',
          mode: 'try'
        },
        handler: signup,
        description: 'users can signup with an email.',
        notes: 'usage: POST/signup',
        tags: ['signup']
      }
    }, {
      method: 'POST',
      path: '/login',
      config: {
        auth: {
          strategy: 'jwt',
          mode: 'try'
        },
        handler: login,
        description: 'user can login with email and password.',
        notes: 'usage: POST/login',
        tags: ['login', 'jwt']
      }
    }, {
      method: 'GET',
      path: '/me',
      config: {
        auth: {
          strategy: 'jwt',
          mode: 'try'
        },
        handler: me,
        description: 'user can see his profile!',
        notes: 'usage: GET/me',
        tags: ['logedin', 'jwt']
      }
    }, {
      method: 'GET',
      path: '/feed',
      config: {
        auth: {
          strategy: 'jwt',
          mode: 'try'
        },
        handler: feed,
        description: 'anyway, user can gets the feeds.',
        notes: 'usage: GET/feed',
        tags: ['feed', 'jwt']
      }
    }, {
      method: 'POST',
      path: '/logout',
      config: {
        auth: {
          strategy: 'jwt',
          mode: 'try'
        },
        handler: logout,
        description: 'user can log out from here.',
        notes: 'usage: POST/logout',
        tags: ['logout', 'jwt']
      }
    }
  ]
)

server.start((err) => {
  if (err) throw err

  console.log(`Here you can see power of magic: ${server.info.uri}`)
})
