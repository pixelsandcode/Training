'use strict'

const Hapi = require('hapi')
const server = new Hapi.Server()

const ES = require('elasticsearch')
const client = new ES.Client({host: 'localhost:9200'})

const Puffer = require('puffer')
const db = new Puffer({host: 'localhost', name: 'posts'})
const ODME = require('odme')
const Model = ODME.CB({source: db})

const BaseJoi = require('joi')
const Extension = require('joi-date-extensions')
const Joi = BaseJoi.extend(Extension)

class Post extends Model {
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

server.route([
  {
    method: 'GET',
    path: '/posts',
    handler: (request, reply) => {
      client.search({
        index: 'posts',
        type: 'post',
        body: {
          query: {
            match_all: {}
          }
        }
      }).then((res, err) => {
        if (err) {
          reply(err)
        } else {

          const hits = res.hits.hits
          //console.log(JSON.stringify(res, null, 2))

          for (let i = 0; i < hits.length; i++) {
            //console.log(hits[i]._id)
            Post.get(hits[i]._id).then((res, err) => {
              if (err) {
                reply(err)
              } else {
                reply(res)
              }
            })
          }
          //reply(res.hits.hits)
        }
      })
    },
    config: {
      description: 'Get all post!',
      notes: 'Using elasticsearch query',
      tags: ['api', 'post']
    }
  },
  {
    method: 'GET',
    path: '/posts/{post_key}',
    handler: (request, reply) => {
      Post.get(request.params.post_key).then((res, err) => {
        if (err) {
          reply(err)
        } else {
          reply(res)
        }
      })
    },
    config: {
      description: 'Get post with specific post_key!',
      notes: 'The post_key is required.',
      tags: ['api', 'post']
    }
  },
  {
    method: 'POST',
    path: '/posts',
    handler: (request, reply) => {
      if (request.payload === undefined) {
        reply('There is nothing to create!! Please input data.')
      } else {
        //console.log(request.payload)
        const post = new Post({
          title: request.payload.title,
          body: request.payload.body,
          author: request.payload.author,
          created_at: request.payload.created_at
        })
        post.create(true).then((res, err) => {
          if (err) {
            reply(err)
          } else {
            reply(res)
          }
        })
      }
    },
    config: {
      description: 'Create a new post!',
      notes: 'with key: post_randomID!',
      tags: ['api', 'post']
    }
  },
  {
    method: 'DELETE',
    path: '/posts/{post_key}',
    handler: (request, reply) => {
      if (request.params.post_key === undefined) {
        reply('There is no post_key to delete from!!')
      } else {
        Post.remove(request.params.post_key).then((res, err) => {
          if (err) {
            reply(err)
          } else {
            reply(res)
          }
        })
      }
    },
    config: {
      description: 'Delete a post with specific post_key!',
      notes: 'The post_key is required.',
      tags: ['api', 'delete']
    }
  },
  {
    method: 'PUT',
    path: '/posts/{post_key}',
    handler: (request, reply) => {
      if (request.params.post_key === undefined) {
        reply('There is no post_key to update!!')
      } else {
        Post.get(request.params.post_key).then((res, err) => {
          if (err) {
            reply(err)
          } else {
            const p = new Post({
                title: request.payload.title,
                body: request.payload.body,
                author: request.payload.author,
                created_at: request.payload.created_at
              },
              request.params.post_key)

            p.update(true).then((res, err) => {
              if (err) {
                reply(err)
              } else {
                reply(res)
              }
            })
          }
        })

      }
    },
    config: {
      description: 'Update a specific post with post_key!',
      notes: 'The post_key is required.',
      tags: ['api', 'put', 'update']
    }
  }
])

// Start the server
server.start((err) => {
  if (err)
    console.error(err.message)
  console.log('Server started at ', server.info.uri)
})

