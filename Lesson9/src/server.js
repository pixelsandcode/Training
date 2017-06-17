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

const BaseJoi = require('joi')
const Extension = require('joi-date-extensions')
const Joi = BaseJoi.extend(Extension)

class Post extends Base {
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

const Hapi = require('hapi')
const server = new Hapi.Server()

server.connection({
  port: 8080,
  host: 'localhost'
})

server.register(
  [
    require('vision'),
    require('inert'),
    require('lout')
  ], (err) => {
    if (err)
      console.error(err)
  }
)

server.route({
  method: 'GET',
  path: '/posts/{post_key}',
  handler: (request, reply) => {
    reply(server.methods.getdoc(encodeURIComponent(request.params.post_key)))
  },
  config: {
    description: 'will get the post_1 doc from couchbase',
    notes: 'usage: GET/posts/{post_key}',
    tags: ['route', 'cb', 'get', 'odme']
  }
})

server.method({
  name: 'getdoc',
  method: (postkey) => {
    return Post.get(postkey).then((o) => o)
  }
})

server.route({
  method: 'POST',
  path: '/posts',
  handler: (request, reply) => {
    reply(server.methods.savedoc(request.payload))
  },
  config: {
    description: 'Will get data from postman and store it in couchbase using odme.',
    notes: 'usage: POST/posts',
    tags: ['odme', 'route', 'cb', 'postman', 'post']
  }

})

server.method({
  name: 'savedoc',
  method: (payload) => {
    const pst = new Post({
      title: payload.title,
      body: payload.boy,
      author: payload.author,
      created_at: payload.created_at
    })

    return pst.create(true).then((err, result) => {
      if (err) {
        return err
      } else {
        return result
      }
    })
  }
})

server.route({
  method: 'GET',
  path: '/posts',
  handler: (request, reply) => {
    reply(server.methods.showall())
  },
  config: {
    description: 'Will list all posts.',
    notes: 'usage: GET/posts',
    tags: ['es', 'cb', 'route', 'odme', 'get']
  }
})

server.method({
  name: 'showall',
  method: function() {
    return client.search({
      index: 'post',
      type: 'post',
      body: {
        query: {
          match_all: {}
        }
      }
    }).then((response) => {
      var result = response.hits.hits;
      var keys = [];
      for (var i = 0; i <= result.length - 1; i++) {
        keys[i] = result[i]._id;
      }
      return Post.get(keys).then((o) => o)
    })
  }
})

server.route({
  method: 'DELETE',
  path: '/posts/{post_key}',
  handler: (request, reply) => {
    reply(server.methods.deletedoc(encodeURIComponent(request.params.post_key)))
  },
  config: {
    description: 'Will delete a spesific post',
    notes: 'usage: DELETE/posts/{post_key}',
    tags: ['route', 'cb', 'odme', 'delete']
  }
})

server.method({
  name: 'deletedoc',
  method: (postkey) => {
    return Post.remove(postkey).then((o) => o)
  }

})

server.route({
  method: 'PUT',
  path: '/posts/{post_key}',
  handler: (request, reply) => {
    reply(server.methods.updatedoc( encodeURIComponent(request.params.post_key), request.payload))
  },
  config: {
    description: 'Will update a specific post.',
    notes: 'usage: PUT/posts/{post_key}',
    tags: ['route', 'cb', 'odme', 'put']
  }
})

server.method({
  name: 'updatedoc',
  method: (postkey, payload) => {
    let pst = new Post({
      title: payload.title,
      body: payload.body,
      author: payload.author,
      created_at: payload.created_at,
      //server field is for test its will not add to the doc.
      server: payload.server
    }, postkey)
    return pst.update(true).then((d) => d)
  }
})

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri}`);
})
