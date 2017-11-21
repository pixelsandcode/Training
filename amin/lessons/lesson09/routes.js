module.exports = (client, Post) => {
  const handlers = require('./handlers')(client, Post)
  return [
    {
      method: 'GET',
      path: '/posts',
      config: {
        handler: handlers.get_posts,
        description: 'Get all post!',
        notes: 'Using elasticsearch query',
        tags: ['api', 'post']
      }
    },
    {
      method: 'GET',
      path: '/posts/{post_key}',
      config: {
        handler: handlers.get_post,
        description: 'Get post with specific post_key!',
        notes: 'The post_key is required.',
        tags: ['api', 'post']
      }
    },
    {
      method: 'POST',
      path: '/posts',
      config: {
        handler: handlers.create_post,
        description: 'Create a new post!',
        notes: 'with key: post_randomID!',
        tags: ['api', 'post']
      }
    },
    {
      method: 'DELETE',
      path: '/posts/{post_key}',
      config: {
        handler: handlers.delete_post,
        description: 'Delete a post with specific post_key!',
        notes: 'The post_key is required.',
        tags: ['api', 'delete']
      }
    },
    {
      method: 'PUT',
      path: '/posts/{post_key}',
      config: {
        handler: handlers.update_post,
        description: 'Update a specific post with post_key!',
        notes: 'The post_key is required.',
        tags: ['api', 'put', 'update']
      }
    }
  ]
}