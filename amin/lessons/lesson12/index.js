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
const db = new Puffer({host: 'localhost', name: 'blog'})
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

class Post extends Model {

  PREFIX() {
    return 'p'
  }

  props() {
    return {
      author_name: {
        schema: Joi.string(),
        whiteList: true
      },
      author_email: {
        schema: Joi.string(),
        whiteList: true
      },
      title: {
        schema: Joi.string(),
        whiteList: true
      },
      body: {
        schema: Joi.string(),
        whiteList: true
      }
    }
  }
}


const register = (request, reply) => {
  client.search({
    index: 'blog',
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
        const user = new User({
          email: request.payload.email,
          password: request.payload.password,
          fullname: request.payload.fullname
        })
        // const docs = [user.create(true)]
        // Promise.all(docs).then((res) => {
        //   reply(`Register is complete.\n${res}\n${docs}`)
        // })
        user.create(true).then((res) => {
          reply(res)
        })
      } else {
        reply('This email is already exists. Please use another email to register.')
      }
    }
  })
}

const login = (request, reply) => {
  client.search({
    index: 'blog',
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
      reply(err)

    } else {
      if (res.hits.total == 0) {
        reply('Invalid username and/or password.')
      } else {
        if (request.auth.isAuthenticated) {
          reply('You are already logged in!')
            .header('Authorization', request.auth.authorization)
        } else {
          const obj = {email: request.payload.email}
          const token = jwt.sign(obj, secret_key)

          reply({
            text: `Dear ${res.hits.hits[0]._source.doc.fullname}, You successfully logged in!`,
            jwtTonken: token
          }).header('Authorization', token)
        }
      }
    }
  })
}

const logout = (request, reply) => {
  if (request.auth.isAuthenticated) {
    const blockthis = new blockedTokens({
      token: request.auth.token
    })
    blockthis.create(true).then((res) => {
        reply(`You logged out successfully!\n\n${res}`)
      }
    )
  } else {
    reply('This page is not accessible without authentication.')
  }
}

const me = (request, reply) => {
  if (request.auth.isAuthenticated) {
    client.search({
      index: 'blog',
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
        reply(err)
      } else {
        const n = res.hits.hits[0]._source.doc.fullname,
          e = res.hits.hits[0]._source.doc.email
        reply(`"Home Page"\n\n\nHello ${n},\n\nYour Email: ${e}`)
      }
    })
  } else {
    reply('"Home Page"\n\n\nHello Stranger!\n\nYou can to login to edit your posts!')
  }
}

const post = (request, reply) => {
  if (request.params.post_key === undefined) {
    reply('There is no "post_key" to search from!')
  }
  else {
    console.log(request.params.post_key)
    Post.get(request.params.post_key).then((res, err) => {
      if (err) {
        reply(err)
      } else {
        const Title = res.doc.title
        const Body = res.doc.body
        const Author = res.doc.author_name
        //console.log(res)
        //reply(JSON.stringify(res, null, 2))
        reply(`Title: ${Title}\nBody: ${Body}\nAuthor: ${Author}`)
      }
    })
  }
}

const post_all = (request, reply) => {
  //console.log(request.query.page)
  if (request.query.page == undefined) {

    client.search({
      index: 'blog',
      type: 'post',
      body: {
        from: 0,
        size: 5,
        query: {
          match_all: {}
        }
      }
    }, (err, res) => {
      if (err) {
        //console.log(JSON.stringify(err, null, 2))
        reply(err)
      } else {
        const hits = res.hits.hits
        //console.log(hits.length)
        if (hits.length == 0) {
          reply('There are no posts to show!')
        } else {
          let text = '', t, b, a
          for (let i = 0; i < hits.length; i++) {
            t = hits[i]._source.doc.title
            b = hits[i]._source.doc.body
            a = hits[i]._source.doc.author_name
            text += (`${(i + 1)}- Title: ${t}\nBody: ${b}\nAuthor: ${a}\n\n\n`)
          }
          reply(text)
        }
      }
    })

  } else {

    const page = request.query.page
    client.search({
      index: 'blog',
      type: 'post',
      body: {
        from: page * 5,
        size: 5,
        query: {
          match_all: {}
        }
      }
    }, (err, res) => {
      if (err) {
        //console.error(err)
        reply(err)
      } else {
        const hits = res.hits.hits
        if (hits.length == 0) {
          reply(`There are no posts to show in page ${page}!`)
        } else {
          let text = '', t, b, a
          for (let i = 0; i < hits.length; i++) {
            t = hits[i]._source.doc.title
            b = hits[i]._source.doc.body
            a = hits[i]._source.doc.author_name
            text += (`${(page * 5 + (i + 1))}- Title: ${t}\nBody: ${b}\nAuthor: ${a}\n\n\n`)
          }
          reply(text)
        }
      }
    })

  }
}

const post_me = (request, reply) => {
  if (request.auth.isAuthenticated) {

    if (!request.query.page) {

      client.search({
        index: 'blog',
        type: 'post',
        body: {
          from: 0,
          size: 5,
          query: {
            match: {
              "doc.author_email": request.auth.credentials.email
            }
          }
        }
      }, (err, res) => {
        if (err) {
          //console.error(err)
          reply(err)
        } else {
          const hits = res.hits.hits
          if (hits.length == 0) {
            reply('There are no posts to show!')
          } else {
            let text = '', t, b, a
            for (let i = 0; i < hits.length; i++) {
              t = hits[i]._source.doc.title
              b = hits[i]._source.doc.body
              a = hits[i]._source.doc.author_name
              text += (`${(i + 1)}- Title: ${t}\nBody: ${b}\nAuthor: ${a}\n\n\n`)
            }
            reply(text)
          }
        }
      })

    } else {

      const page = request.query.page
      client.search({
        index: 'blog',
        type: 'post',
        body: {
          from: page * 5,
          size: 5,
          query: {
            match: {
              "doc.author_email": request.auth.credentials.email
            }
          }
        }
      }, (err, res) => {
        if (err) {
          //console.error(err)
          reply(err)
        } else {
          const hits = res.hits.hits
          if (hits.length == 0) {
            reply(`There are no posts to show in page ${page}!`)
          } else {
            let text = '', t, b, a
            for (let i = 0; i < hits.length; i++) {
              t = hits[i]._source.doc.title
              b = hits[i]._source.doc.body
              a = hits[i]._source.doc.author_name
              text += (`${(page * 5 + (i + 1))}- Title: ${t}\nBody: ${b}\nAuthor: ${a}\n\n\n`)
            }
            reply(text)
          }
        }
      })

    }

  } else {
    reply('You need to login first!')
  }
}

const post_create = (request, reply) => {
  if (request.auth.isAuthenticated) {
    const post = new Post({
      author_name: request.auth.credentials.fullname,
      author_email: request.auth.credentials.email,
      title: request.payload.title,
      body: request.payload.body
    })
    post.create(true).then((res) => {
      reply(res)
    })
  } else {
    reply('You need to login first!')
  }
}

const post_remove = (request, reply) => {
  //console.log('------Remove:')
  if (request.auth.isAuthenticated) {

    if (request.params.post_key == undefined) {
      reply('There is no post_key to delete from!!')
    } else {

      client.search({
        index: 'blog',
        type: 'post',
        body: {
          query: {
            match: {
              "doc.docKey": request.params.post_key
            }
          }
        }
      }, (err, res) => {
        if (err) {
          //console.error(err)
          reply(err)
        } else {

          const hits = res.hits.hits
          if (hits.total == 0) {
            reply('The post does not exists.')
          } else {

            if (hits[0]._source.doc.author_email === request.auth.credentials.email) {

              Post.remove(request.params.post_key).then((res) => {
                reply(res)
              })

            } else {
              reply('You can not delete this post. This post is not belong to current user.')
            }

          }

        }
      })

    }

  } else {
    reply('You need to login first!')
  }
}

const post_update = (request, reply) => {
  //console.log('------Update:')
  if (request.auth.isAuthenticated) {

    if (request.params.post_key == undefined) {
      reply('There is no post_key to update from!!')
    } else {

      client.search({
        index: 'blog',
        type: 'post',
        body: {
          query: {
            match: {
              "doc.docKey": request.params.post_key
            }
          }
        }
      }, (err, res) => {
        if (err) {
          //console.error(err)
          reply(err)
        } else {

          const hits = res.hits.hits
          if (hits.total == 0) {
            reply('There is no post exist with this key.')
          } else {

            if (hits[0]._source.doc.author_email === request.auth.credentials.email) {

              const p = new Post({
                  title: request.payload.title,
                  body: request.payload.body,
                  author_name: request.auth.credentials.fullname,
                  author_email: request.auth.credentials.email
                },
                request.params.post_key)

              p.update(true).then((res) => {
                reply(res)
              })

            } else {
              reply('You can not delete this post. This post is not belong to current user.')
            }

          }

        }
      })

    }

  } else {
    reply('You need to login first!')
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
    index: 'blog',
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
      //console.log('request.auth.token: ', request.auth.token)
    } else {
      //console.log('request.auth.token: ', request.auth.token)
      if (response.hits.total == 0) {
        client.search({
          index: 'blog',
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
              console.log(
                `Validated email: ${decoded.email}`
              )
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
    path: '/',
    handler: me,
    config: {
      auth: false,  //This page is public
      description: 'This is a home page.',
      notes: 'This page is public. There is no need for authentication',
      tags: ['get', 'home', 'blog']
    }
  },
  {
    method: 'GET',
    path: '/me',
    handler: me,
    config: {
      auth: {
        strategy: 'jwt',
        mode: 'try'
      },
      description: 'This page shows users fullname and email.',
      notes: 'Logging in is necessary.',
      tags: ['authentication', 'get', 'me', 'blog']
    }
  },
  {
    method: 'GET',
    path: '/posts',
    handler: post_all,
    config: {
      auth: false,  // This page is public
      description: 'Brings all posts within the post object. ' +
      'There should be the author (which is a user object) and it has pagination.',
      notes: 'Logging in is optional!',
      tags: ['get', 'posts', 'blog']
    }
  },
  {
    method: 'GET',
    path: '/posts/{post_key}',
    handler: post,
    config: {
      auth: false,  // This page is public
      description: 'Brings a post by ID and is accessible by all users.',
      notes: 'Use "/posts/{post_key}" for search',
      tags: ['get', 'post', 'blog']
    }
  },
  {
    method: 'GET',
    path: '/me/posts',
    handler: post_me,
    config: {
      auth: {
        strategy: 'jwt',
        mode: 'try'
      },
      description: 'Shows all of current user’s posts with pagination.',
      notes: 'Logging in is required!',
      tags: ['authentication', 'get', 'post', 'blog']
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
      tags: ['post', 'login', 'blog']
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
      tags: ['authentication', 'post', 'logout', 'blog']
    }
  },
  {
    method: 'POST',
    path: '/register',
    handler: register,
    config: {
      auth: false, // don't require people to be logged in to see the sign-up page! (duh!)
      description: 'Register a user',
      notes: 'Needs email, password and fullname.',
      tags: ['post', 'register', 'blog']
    }
  },
  {
    method: 'POST',
    path: '/posts',
    handler: post_create,
    config: {
      auth: {
        strategy: 'jwt',
        mode: 'try'
      },
      description: 'Create a post for logged-in user',
      notes: 'Login is required. Needs title and body for the new post.',
      tags: ['authentication', 'post', 'create', 'blog']
    }
  },
  {
    method: 'DELETE',
    path: '/posts/{post_key}',
    handler: post_remove,
    config: {
      auth: {
        strategy: 'jwt',
        mode: 'try'
      },
      description: 'Removes a post for logged-in user',
      notes: 'Login is required. Needs valid "post_key".',
      tags: ['authentication', 'DELETE', 'remove', 'blog']
    }
  },
  {
    method: 'PUT',
    path: '/posts/{post_key}',
    handler: post_update,
    config: {
      auth: {
        strategy: 'jwt',
        mode: 'try'
      },
      description: 'Updates a post for logged-in user',
      notes: 'Login is required. Needs valid "post_key", title and a body.',
      tags: ['authentication', 'PUT', 'update', 'blog']
    }
  }
])

// Start the server
server.start((err) => {
  if (err)
    console.error(err.message)
  console.log('Server started at ', server.info.uri)
})