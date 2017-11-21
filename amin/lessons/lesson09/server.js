'use strict'

const Hapi = require('hapi')
const server = new Hapi.Server()
const client = new require('elasticsearch').Client({host: 'localhost:9200'})
const model = require('odme').CB({
  source: new require('puffer')({
    host: 'localhost',
    name: 'posts'
  })
})

const Joi = require('joi').extend(require('joi-date-extensions'))

class Post extends model {

  PREFIX() {
    return 'post'
  }

  props() {
    return {
      title: {
        schema: Joi.string(),
        whiteList: true
      },
      body: {
        schema: Joi.string(),
        whiteList: true
      },
      author: {
        schema: Joi.string(),
        whiteList: true
      },
      created_at: {
        schema: Joi.date().format('YYYY-MM-DD'),
        whiteList: true
      }
    }
  }
}

server.connection({host: 'localhost', port: 3000})

server.register([require('lout'), require('inert'), require('vision')],
  (err) => {
    if (err)
      console.log(err)
  }
)

server.route(require('./routes')(client, Post))

server.start((err) => {
  if (err)
    console.error(err.message)
  console.log('Server started at ', server.info.uri)
})

