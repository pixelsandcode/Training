"use strict"

module.exports = (server, options) => {

  const User = require('../models/user')(server, options),
    Post = require('../models/post')(server, options),
    blockedTokens = require('../models/blocked-tokens')(server, options)

  return {
    // list(request, reply) {
    //   let blog = new Blog()
    //   reply.nice(blog.list())
    // }

    register: (request, reply) => {
      const query = {
        body: {
          query: {
            match: {
              "doc.email": request.payload.email
            }
          }
        }
      }
      User.search('b_user', query).then((res, err) => {
        if (err) {
          reply('There was a problem in finding email:\n\n', err)
        } else {
          if (res.hits.total == 0) {
            const user = new User({
              email: request.payload.email,
              password: request.payload.password,
              fullname: request.payload.fullname
            })
            user.create(true).then((res) => {
              reply(res)
            })
          } else {
            reply('This email is already exists. Please use another email to register.')
          }
        }
      })
    },
    login: (request, reply) => {
      const query = {
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
      }
      User.search('b_user', query).then((res, err) => {
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
              const token = server.methods.jwt.sign(obj)
              reply({
                text: `Dear ${res.hits.hits[0]._source.doc.fullname}, You successfully logged in!`,
                jwtTonken: token
              }).header('Authorization', token)
            }
          }
        }
      })
    },
    logout: (request, reply) => {
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
    },
    me: (request, reply) => {
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
    },
    post: (request, reply) => {
      if (request.params.post_key == undefined) {
        reply('There is no "post_key" to search from!')
      }
      else {
        console.log(request.params.post_key)
        Post.get(request.params.post_key).then((res) => {
          const t = res.doc.title, b = res.doc.body, a = res.doc.author_name
          reply(`Title: ${t}\nBody: ${b}\nAuthor: ${a}`)
        })
      }
    },
    post_all: (request, reply) => {
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
              match_all: {}
            }
          }
        }, (err, res) => {
          if (err) {
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
    },
    post_me: (request, reply) => {
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
    },
    post_create: (request, reply) => {
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
    },
    post_remove: (request, reply) => {
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
              reply(err)
            } else {
              const hits = res.hits.hits
              if (hits.total == 0) {
                reply('The post does not exists.')
              } else {
                if (hits[0]._source.doc.author_email == request.auth.credentials.email) {
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
    },
    post_update: (request, reply) => {
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
              reply(err)
            } else {
              const hits = res.hits.hits
              if (hits.total == 0) {
                reply('There is no post exist with this key.')
              } else {
                if (hits[0]._source.doc.author_email == request.auth.credentials.email) {
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
  }
}
