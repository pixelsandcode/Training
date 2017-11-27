module.exports = (server, options) => {

  // const Blog = require('../handlers/sample')(server, options)
  // const BlogValidator = require('../validators/sampleValidator')(options)
  // return [
  //   {
  //     method: 'GET',
  //     path: '/v1/blog',
  //     config: {
  //       handler: Blog.list,
  //       validate: BlogValidator.list,
  //       description: 'TODO: System generated this',
  //       tags: ['system', 'TODO']
  //     }
  //   }
  // ]

  const handlers = require('../handlers/sample')(server, options)
  return [
    {
      method: 'GET',
      path: '/',
      config: {
        handler: handlers.me,
        auth: false,
        description: 'This is a home page.',
        notes: 'This page is public. There is no need for authentication',
        tags: ['get', 'home', 'blog']
      }
    },
    {
      method: 'GET',
      path: '/me',
      config: {
        handler: handlers.me,
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
      config: {
        handler: handlers.postAll,
        auth: false,
        description: 'Brings all posts within the post object. ' +
        'There should be the author (which is a user object) and it has pagination.',
        notes: 'Logging in is optional!',
        tags: ['get', 'posts', 'blog']
      }
    },
    {
      method: 'GET',
      path: '/posts/{post_key}',
      config: {
        handler: handlers.post,
        auth: false,
        description: 'Brings a post by ID and is accessible by all users.',
        notes: 'Use "/posts/{post_key}" for search',
        tags: ['get', 'post', 'blog']
      }
    },
    {
      method: 'GET',
      path: '/me/posts',
      config: {
        handler: handlers.postMe,
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
      config: {
        handler: handlers.login,
        auth: false,
        description: 'This is a login page.',
        notes: 'Email and Password is required!',
        tags: ['post', 'login', 'blog']
      }
    },
    {
      method: 'POST',
      path: '/logout',
      config: {
        handler: handlers.logout,
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
      config: {
        handler: handlers.register,
        auth: false,
        description: 'Register a user',
        notes: 'Needs email, password and fullname.',
        tags: ['post', 'register', 'blog']
      }
    },
    {
      method: 'POST',
      path: '/posts',
      config: {
        handler: handlers.postCreate,
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
      config: {
        handler: handlers.postRemove,
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
      config: {
        handler: handlers.postUpdate,
        auth: {
          strategy: 'jwt',
          mode: 'try'
        },
        description: 'Updates a post for logged-in user',
        notes: 'Login is required. Needs valid "post_key", title and a body.',
        tags: ['authentication', 'PUT', 'update', 'blog']
      }
    }
  ]

}
