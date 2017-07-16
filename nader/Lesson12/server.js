#!/usr/bin/env node

'use strict';

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
const jwt = require('jsonwebtoken')

class User extends Base {
  PREFIX() {
    return 'user'
  }
  doc_Type() {
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
      name: {
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
  doc_Type() {
    return 'token'
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

class Post extends Base {
  PREFIX() {
    return 'post'
  }
  doc_Type() {
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
      }
    }
  }
}

var secret = 'pixelsandcode'
var validate = (decoded, request, callback) => {
  client.search({
    index: 'jwt-user-post',
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
      console.log(`this token validation failed: ${request.auth.token}`)
    } else {
      if (response.hits.total == 0) {
        client.search({
          index: 'jwt-user-post',
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
            console.log(`validation failed!`)
          } else {
            if (response.hits.total == 0) {
              callback(null, false)
              console.log(`validation failed!`)
            } else {
              console.log(`validated email : ${decoded.email}`)
              callback(null, true)
            }
          }
        })
      } else {
        callback(null, false)
        console.log(`validation failed!`)
      }
    }
  })
}

const Hapi = require('hapi')
const server = new Hapi.Server()

server.connection({
  port: 8080,
  host: 'localhost'
})

server.register([require('hapi-auth-jwt2'), require('vision'), require('inert'),
  require('lout')
], (err) => {
  if (err) {
    console.error(err)
  }

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
      // NOTE: POST/register
      {
        method: 'POST',
        path: '/register',
        config: {
          auth: {
            strategy: 'jwt',
            mode: 'try'
          },
          handler: signup,
          description: 'user can register with email,password and name.',
          notes: 'usage: POST/register',
          tags: ['authorization', 'jwt', 'signup']
        }
      },
      // NOTE: POST/login
      {
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
          tags: ['authorization', 'jwt', 'login']
        }
      },
      // NOTE: POST/logout
      {
        method: 'POST',
        path: '/logout',
        config: {
          auth: {
            strategy: 'jwt',
            mode: 'try'
          },
          handler: logout,
          description: 'user can log out.',
          notes: 'usage: POST/logout',
          tags: ['authorization', 'jwt', 'logout']
        }
      },
      // NOTE: GET/me
      {
        method: 'GET',
        path: '/me',
        config: {
          auth: {
            strategy: 'jwt',
            mode: 'try'
          },
          handler: me,
          description: "will bring current user’s name and email",
          notes: 'usage: GET/me',
          tags: ['profile', 'user']

        }
      },
      // NOTE: GET/post/{postkey}
      {
        method: 'GET',
        path: '/post/{postkey}',
        config: {
          auth: {
            strategy: 'jwt',
            mode: 'try'
          },
          handler: getPostAccessible,
          description: 'will bring a post by ID and is accessible by all users',
          notes: 'usage: GET/post/{postkey}',
          tags: ['all', 'users', 'get']
        }
      },
      // NOTE: POST/posts
      {
        method: 'POST',
        path: '/posts',
        config: {
          auth: {
            strategy: 'jwt',
            mode: 'try'
          },
          handler: createPost,
          description: 'will create a post for a user',
          notes: 'usage: POST/posts',
          tags: ['create', 'post']
        }
      },
      // NOTE: GET/posts
      {
        method: 'GET',
        path: '/posts',
        config: {
          auth: {
            strategy: 'jwt',
            mode: 'try'
          },
          handler: getPostWithPagination,
          description: 'will bring all posts within the post object there should be the author (which is a user object). This has pagination.',
          notes: 'usage: GET/posts',
          tags: ['all', 'author', 'post']
        }
      },
      // NOTE: GET/me/posts
      {
        method: 'GET',
        path: '/me/posts',
        config: {
          auth: {
            strategy: 'jwt',
            mode: 'try'
          },
          handler: getMyDocs,
          description: 'will list all of current user’s posts with pagination',
          notes: 'usage: GET/me/posts',
          tags: ['all', 'post']
        }
      },
      // NOTE: DELETE/posts/{post_key}
      {
        method: 'DELETE',
        path: '/posts/{post_key}',
        config: {
          auth: {
            strategy: 'jwt',
            mode: 'try'
          },
          handler: removeMyDoc,
          description: 'will delete a post only if user with current login has created the post',
          notes: 'usage: DELETE/posts/{post_key}',
          tags: ['delete', 'post']
        }
      },
      // NOTE: PUT/posts/{post_key}
      {
        method: 'PUT',
        path: '/posts/{post_key}',
        config: {
          auth: {
            strategy: 'jwt',
            mode: 'try'
          },
          handler: updateMyDoc,
          description: 'will update a post only if user with current login has created the post',
          notes: 'usage: PUT/posts/{post_key}',
          tags: ['upate', 'post']
        }
      },
    ]
  )

})

const signup = (request, reply) => {
  client.search({
    index: 'jwt-user-post',
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
        let usr = new User({
          email: request.payload.email,
          password: request.payload.password,
          name: request.payload.name
        })
        var doc1 = usr.create(true)
        var docs = [doc1]
        Promise.all(docs).then(
          (d) => {
            console.log(d)
            reply('signed up successfully.')
          }
        )
      } else {
        console.log(`email exists!`)
        reply('email exists.')
      }
    }
  })
}

const login = (request, reply) => {
  client.search({
    index: 'jwt-user-post',
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

const me = (request, reply) => {
  if (request.auth.isAuthenticated) {
    var decodedToken = request.auth.credentials
    var tokenEmail = decodedToken.email
    console.log(tokenEmail)
    client.search({
      index: 'jwt-user-post',
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

const getPostAccessible = (request, reply) => {
  if (request.auth.isAuthenticated) {
    var post_key = encodeURIComponent(request.params.postkey)
    console.log(`post_key: ${post_key}`)
    Post.get(post_key).then(
      (o) => {
        console.log(o)
        reply(o)
      }
    )
  } else {
    reply('you must login first.')
  }
}

const createPost = (request, reply) => {
  if (request.auth.isAuthenticated) {
    var payload = request.payload
    let pst = new Post({
      title: payload.title,
      body: payload.body,
      author: payload.author
    })
    pst.create(true).then(
      (o) => {
        console.log(o)
        reply('doc created.')
      }
    )
  } else {
    reply('you must login first.')
  }
}

const getPostWithPagination = (request, reply) => {
  if (request.auth.isAuthenticated) {
    if (!request.query.page) {
      client.search({
        index: 'jwt-user-post',
        type: 'post',
        body: {
          from: 0,
          size: 5,
          sort: [{
            "doc.title": 'asc'
          }, {
            "doc.body": 'asc'
          }],
          _source: {
            includes: ['doc.*']
          },
          query: {
            match_all: {}
          }
        }
      }, (error, response) => {
        if (error) {
          console.log(error)
          reply('there was a problem please try again later.')
        } else {
          console.log('tonestam')
          reply(response)
        }
      })
    } else {
      var page = request.query.page
      client.search({
        index: 'jwt-user-post',
        type: 'post',
        body: {
          from: page * 5,
          size: 5,
          sort: [{
            "doc.title": 'asc'
          }, {
            "doc.body": 'asc'
          }],
          _source: {
            includes: ['doc.*']
          },
          query: {
            match_all: {}
          }
        }
      }, (error, response) => {
        if (error) {
          console.log(error)
          reply('there was a problem please try again later.')
        } else {
          console.log('tonestam')
          reply(response)
        }
      })
    }
  } else {
    console.log(`permision denied.user is not loged in.`)
    reply('you must login first.')
  }
}

const getMyDocs = (request, reply) => {
  if (request.auth.isAuthenticated) {
    var decodedToken = request.auth.credentials
    var tokenEmail = decodedToken.email
    var page = request.query.page
    console.log(tokenEmail)
    client.search({
      index: 'jwt-user-post',
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
        console.log(response.hits.hits[0]._source.doc.name)
        var authorName = response.hits.hits[0]._source.doc.name
        if (!request.query.page) {
          client.search({
            index: 'jwt-user-post',
            type: 'post',
            body: {
              from: 0,
              size: 5,
              sort: [{
                "doc.title": 'asc'
              }, {
                "doc.body": 'asc'
              }],
              _source: {
                includes: ['doc.*']
              },
              query: {
                match: {
                  "doc.author": authorName
                }
              }
            }
          }, (error, response) => {
            if (error) {
              console.error(error)
              reply('there was problem try again later.')
            } else {
              console.log('tonestam')
              reply(response)
            }
          })
        } else {
          client.search({
            index: 'jwt-user-post',
            type: 'post',
            body: {
              from: page * 5,
              size: 5,
              sort: [{
                "doc.title": 'asc'
              }, {
                "doc.body": 'asc'
              }],
              _source: {
                includes: ['doc.*']
              },
              query: {
                match: {
                  "doc.author": authorName
                }
              }
            }
          }, (error, response) => {
            if (error) {
              console.error(error)
              reply('there was problem try again later.')
            } else {
              console.log('tonestam')
              reply(response)
            }
          })
        }
      }
    })
  } else {
    console.log('permision denied. user is not loged in.')
    reply('you must login first.')
  }
}

const removeMyDoc = (request, reply) => {
  if (request.auth.isAuthenticated) {
    var decodedToken = request.auth.credentials
    var tokenEmail = decodedToken.email
    var docKey = encodeURIComponent(request.params.post_key)
    client.search({
      index: 'jwt-user-post',
      type: 'post',
      body: {
        query: {
          match: {
            "doc.docKey": docKey
          }
        }
      }
    }, (error, response) => {
      if (error) {
        console.error(error)
        reply('there was a problem please try again later.')
      } else {
        if (response.hits.total == 0) {
          reply('post does not exists.')
          console.log('post does not exists.')
        } else {
          var author = response.hits.hits[0]._source.doc.author
          console.log(author)
          client.search({
            index: 'jwt-user-post',
            type: 'user',
            body: {
              query: {
                match: {
                  "doc.name": author
                }
              }
            }
          }, (error, response) => {
            if (error) {
              console.error(error)
              reply('there was a problem please try again later.')
            } else {
              var username = response.hits.hits[0]._source.doc.name
              if (username == author) {
                Post.remove(docKey).then(
                  (o) => {
                    console.log(o)
                    reply('post removed.')
                  }
                )
              } else {
                console.log(
                  `permision denied. user is not the author`);
                reply('this post does not belong to you.')
              }
            }
          })
        }
      }
    })
  } else {
    console.log('permision denied. user is not loged in.')
    reply('you must login first.')
  }
}

const updateMyDoc = (request, reply) => {
  if (request.auth.isAuthenticated) {
    var decodedToken = request.auth.credentials
    var tokenEmail = decodedToken.email
    var docKey = encodeURIComponent(request.params.post_key)
    client.search({
      index: 'jwt-user-post',
      type: 'post',
      body: {
        query: {
          match: {
            "doc.docKey": docKey
          }
        }
      }
    }, (error, response) => {
      if (error) {
        console.error(error)
        reply('there was a problem please try again later.')
      } else {
        if (response.hits.total == 0) {
          reply('post does not exists.')
          console.log('post does not exists.')
        } else {
          var author = response.hits.hits[0]._source.doc.author
          console.log(author)
          client.search({
            index: 'jwt-user-post',
            type: 'user',
            body: {
              query: {
                match: {
                  "doc.name": author
                }
              }
            }
          }, (error, response) => {
            if (error) {
              console.error(error)
              reply('there was a problem please try again later.')
            } else {
              var username = response.hits.hits[0]._source.doc.name
              if (username == author) {
                var payload = request.payload
                let pst = new Post({
                  title: payload.title,
                  body: payload.body,
                  author: payload.author,
                }, docKey)
                pst.update(true).then(
                  (d) => {
                    console.log(d)
                    reply('post updated.')
                  }
                )
              } else {
                console.log(
                  `permision denied. user is not the author`);
                reply('this post does not belong to you.')
              }
            }
          })
        }
      }
    })
  } else {
    console.log('permision denied. user is not loged in.')
    reply('you must login first.')
  }
}

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri}`);
})
