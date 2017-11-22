'use strict'

const Hapi = require('hapi')
const server = new Hapi.Server()
server.connection({host: 'localhost', port: 3000})

const Joi = require('joi')
const Promise = require('bluebird')
const jwt = require('jsonwebtoken')

const client = new require('elasticsearch').Client({host: 'localhost:9200'})

const db = new require('puffer')({host: 'localhost', name: 'usersjwt'})
const Model = require('odme').CB({source: db})

class User extends Model {

  PREFIX() {
    return 'u'
  }

  props() {
    return {
      email: {
        schema: Joi.string().email(),
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

const validate = (decoded, request, callback) => {
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
    } else {
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
server.auth.strategy('jwt', 'jwt',
  {
    key: secret_key,
    validateFunc: validate,
    verifyOptions: {algorithms: ['HS256']}
  })
server.auth.default('jwt')

server.route(require('./routes')(client, User, blockedTokens, Promise, jwt, secret_key))

server.start((err) => {
  if (err)
    console.error(err)
  console.log('Server started at ', server.info.uri)
})