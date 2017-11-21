module.exports = (client, Post) => {
  return {
    get_posts: (request, reply) => {
      client.search({
        index: 'posts',
        type: 'post',
        query: {
          match_all: {}
        }
      }).then((res, err) => {
        if (err) {
          reply(err)
        } else {
          const hits = res.hits.hits
          if (hits.length == 0) {
            reply('There are no posts to show.')
          } else {
            let id = []
            for (let i = 0; i < hits.length; i++) {
              id[i] = hits[i]._id
            }
            Post.get(id).then((res) => {
              reply(res)
            })
          }
        }
      })
    },
    get_post: (request, reply) => {
      Post.get(request.params.post_key).then((res) => {
        reply(res)
      })
    },
    create_post: (request, reply) => {
      if (request.payload == undefined) {
        reply('There is nothing to create!! Please input data.')
      } else {
        const post = new Post({
          title: request.payload.title,
          body: request.payload.body,
          author: request.payload.author,
          created_at: request.payload.created_at
        })
        post.create(true).then((res) => {
          reply(res)
        })
      }
    },
    delete_post: (request, reply) => {
      if (request.params.post_key == undefined) {
        reply('There is no post_key to delete from!!')
      } else {
        Post.remove(request.params.post_key).then((res) => {
          reply(res)
        })
      }
    },
    update_post: (request, reply) => {
      if (request.params.post_key == undefined) {
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

            p.update(true).then((res) => {
              reply(res)
            })
          }
        })
      }
    }
  }
}