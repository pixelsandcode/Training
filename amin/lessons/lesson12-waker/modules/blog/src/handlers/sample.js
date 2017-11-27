"use strict"
const Bodybuilder = require('bodybuilder')

module.exports = (server, options) => {

  const User = require('../models/user')(server, options)
  const Post = require('../models/post')(server, options)
  const BlockedTokens = require('../models/blocked-tokens')(server, options)

  return {
    register: (request, reply) => {
      // const query = {
      //   body: {
      //     query: {
      //       match: {
      //         "doc.email": request.payload.email
      //       }
      //     }
      //   }
      // }
      const body = Bodybuilder().query('match', 'doc.email', request.payload.email)
      // console.log(body)
      const query = {body: body.build()}
      // console.log(JSON.stringify(query, null, 2))
      User.search('b_user', query).then((res) => {
        if (res instanceof Error) {
          reply('There was a problem in finding email.')
        } else {
          // res.total == undefined ? console.log('tohi') : console.log(res)
          // console.log(res.length)
          // if (res.hits.total == 0) {
          if ((res.length == undefined) || (res.length == 0)) {
            const user = new User({
              email: request.payload.email,
              password: request.payload.password,
              fullname: request.payload.fullname
            })
            console.log(user)
            user.create(true).then((res) => {
              if (res instanceof Error) {
                reply('There was a problem in creating email.')
              } else {
                reply(res)
              }
            })
          } else {
            reply('This email is already exists. Please use another email to register.')
          }
        }
      })
    },
    login: (request, reply) => {
      // const query = {
      //   body: {
      //     query: {
      //       bool: {
      //         must: [
      //           {
      //             match: {
      //               "doc.email": request.payload.email
      //             }
      //           },
      //           {
      //             match: {
      //               "doc.password": request.payload.password
      //             }
      //           }]
      //       }
      //     }
      //   }
      // }
      const body = Bodybuilder()
        .query('match', 'doc.email', request.payload.email)
        .query('match', 'doc.password', request.payload.password)
      const query = {body: body.build()}
      // console.log(JSON.stringify(query, null, 2))
      User.search('b_user', query).then((res) => {
        if (res instanceof Error) {
          reply('There was a problem in finding user.')
        } else {
          // console.log(res.length)
          if ((res.length == undefined) || (res.length == 0)) {
            reply('Invalid username and/or password.')
          } else {
            if (request.auth.isAuthenticated) {
              reply('You are already logged in!')
                .header('Authorization', request.auth.authorization)
            } else {
              const obj = {email: request.payload.email}
              const token = server.methods.jwt.create(obj)
              // console.log(JSON.stringify(token, null, 2))
              reply({
                text: `Dear ${res[0].fullname}, You successfully logged in!`,
                jwtTonken: token
              }).header('Authorization', token)
            }
          }
        }
      })
    },
    logout: (request, reply) => {
      if (request.auth.isAuthenticated) {
        const blockedToken = new BlockedTokens({
          token: request.auth.token
        })
        blockedToken.create(true).then((res) => {
            reply(`You logged out successfully!\n\n${res}`)
          }
        )
      } else {
        reply('This page is not accessible without authentication.')
      }
    },
    me: (request, reply) => {
      if (request.auth.isAuthenticated) {
        // const query = {
        //   body: {
        //     query: {
        //       match: {
        //         "doc.email": request.auth.credentials.email
        //       }
        //     }
        //   }
        // }
        const body = Bodybuilder().query('match', 'doc.email', request.auth.credentials.email)
        const query = {body: body.build()}
        User.search('b_user', query).then((res) => {
          const name = res[0].fullname
          reply(`"Home Page"\n\n\nWelcome, ${name}! :-D\n\nYou can create/edit your post now!`)
        })
      } else {
        reply('"Home Page"\n\n\nHello Stranger!\n\nYou can login to edit your posts!')
      }
    },
    post: (request, reply) => {
      const key = request.params.post_key
      // console.log('1:', request.params.post_key)

      if (request.params.post_key == undefined) {
        reply('There is no "post_key" to search from!')
      }
      else {
        // console.log('2:', key)
        Post.get(key).then((res) => {
          // const t = res.doc.title, b = res.doc.body, a = res.doc.author_name
          // reply(`Title: ${t}\nBody: ${b}\nAuthor: ${a}`)
          if (res instanceof Error) {
            console.log('2:', key)
            reply(`There was a problem in finding the post: ${key}`)
          } else {
            reply(res)
          }
        })
      }
    },
    postAll: (request, reply) => {
      if (request.query.page == undefined) {
        const body = Bodybuilder().query('match_all').from(0).size(5)
        const query = {body: body.build()}
        User.search('b_post', query).then((res) => {
          if (res instanceof Error) {
            reply('There was a problem in finding posts.')
          } else {
            if ((res.length == undefined) || (res.length == 0)) {
              reply('There are no posts to show!')
            } else {
              let text = '', t, b, a
              for (let i = 0; i < res.length; i++) {
                t = res[i].title
                b = res[i].body
                a = res[i].author_name
                text += (`${(i + 1)}- Title: ${t}\nBody: ${b}\nAuthor: ${a}\n\n\n`)
              }
              reply(text)
            }
          }
        })
      } else {
        const page = request.query.page
        const body = Bodybuilder().query('match_all').from(page * 5).size(5)
        const query = {body: body.build()}
        User.search('b_post', query).then((res) => {
          if (res instanceof Error) {
            reply('There was a problem in finding posts.')
          } else {
            if ((res.length == undefined) || (res.length == 0)) {
              reply(`There are no posts to show in page ${page}!`)
            } else {
              let text = '', t, b, a
              for (let i = 0; i < res.length; i++) {
                t = res[i].title
                b = res[i].body
                a = res[i].author_name
                text += (`${(page * 5 + (i + 1))}- Title: ${t}\nBody: ${b}\nAuthor: ${a}\n\n\n`)
              }
              reply(text)
            }
          }
        })
      }
    },
    postMe: (request, reply) => {
      if (request.auth.isAuthenticated) {
        if (!request.query.page) {
          // const query = {
          //   body: {
          //     from: 0,
          //     size: 5,
          //     query: {
          //       match: {
          //         "doc.author_email": request.auth.credentials.email
          //       }
          //     }
          //   }
          // }
          const body = Bodybuilder()
            .query('match', 'doc.author_email', request.auth.credentials.email)
            .from(0)
            .size(5)
          const query = {body: body.build()}
          User.search('b_post', query).then((res) => {
            if (res instanceof Error) {
              reply('There was a problem in finding posts.')
            } else {
              if ((res.length == undefined) || (res.length == 0)) {
                reply('There are no posts to show!')
              } else {
                let text = '', t, b, a
                for (let i = 0; i < res.length; i++) {
                  t = res[i].title
                  b = res[i].body
                  a = res[i].author_name
                  text += (`${(i + 1)}- Title: ${t}\nBody: ${b}\nAuthor: ${a}\n\n\n`)
                }
                reply(text)
              }
            }
          })
        } else {
          const page = request.query.page
          // const query = {
          //   body: {
          //     from: page * 5,
          //     size: 5,
          //     query: {
          //       match: {
          //         "doc.author_email": request.auth.credentials.email
          //       }
          //     }
          //   }
          // }
          const body = Bodybuilder()
            .query('match', 'doc.author_email', request.auth.credentials.email)
            .from(page * 5)
            .size(5)
          const query = {body: body.build()}
          User.search('b_post', query).then((res) => {
            if (res instanceof Error) {
              reply('There was a problem in finding posts.')
            } else {
              if ((res.length == undefined) || (res.length == 0)) {
                reply(`There are no posts to show in page ${page}!`)
              } else {
                let text = '', t, b, a
                for (let i = 0; i < res.length; i++) {
                  t = res[i].title
                  b = res[i].body
                  a = res[i].author_name
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
    postCreate: (request, reply) => {
      if (request.auth.isAuthenticated) {
        const post = new Post({
          author_name: request.auth.credentials.fullname,
          author_email: request.auth.credentials.email,
          title: request.payload.title,
          body: request.payload.body
        })
        post.create(true).then((res) => {
          if (res instanceof Error) {
            reply('There was a problem in creating post.')
          } else {
            reply(res)
          }
        })
      } else {
        reply('You need to login first!')
      }
    },
    postRemove: (request, reply) => {
      if (request.auth.isAuthenticated) {
        if (request.params.post_key == undefined) {
          reply('There is no post_key to delete from!!')
        } else {
          const body = Bodybuilder().query('match', 'doc.docKey', request.params.post_key)
          const query = {body: body.build()}
          User.search('b_post', query).then((res) => {
            if (res instanceof Error) {
              reply('There was a problem in finding post.')
            } else {
              if ((res.length == undefined) || (res.length == 0)) {
                reply('The post does not exists.')
              } else {
                if (res[0].author_email == request.auth.credentials.email) {
                  Post.remove(request.params.post_key).then((res) => {
                    if (res instanceof Error) {
                      reply('There was a problem in removing post.')
                    } else {
                      reply(res)
                    }
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
    postUpdate: (request, reply) => {
      if (request.auth.isAuthenticated) {
        if (request.params.post_key == undefined) {
          reply('There is no post_key to update from!!')
        } else {
          const body = Bodybuilder().query('match', 'doc.docKey', request.params.post_key)
          const query = {body: body.build()}
          User.search('b_post', query).then((res) => {
            if (res instanceof Error) {
              reply('There was a problem in finding post.')
            } else {
              if ((res.length == undefined) || (res.length == 0)) {
                reply('There is no post exist with this key.')
              } else {
                if (res[0].author_email != request.auth.credentials.email) {
                  reply('You can not delete this post. This post is not belong to you.')
                } else {
                  const post = new Post({
                      title: request.payload.title,
                      body: request.payload.body,
                      author_name: request.auth.credentials.fullname,
                      author_email: request.auth.credentials.email
                    },
                    request.params.post_key)
                  post.update(true).then((res) => {
                    if (res instanceof Error) {
                      reply('There was a problem in updating post.')
                    } else {
                      reply(res)
                    }
                  })
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
