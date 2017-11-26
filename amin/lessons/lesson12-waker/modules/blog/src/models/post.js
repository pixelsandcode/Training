"use strict"

module.exports = (server, options) => {
  return class Post extends server.methods.model.base('application') {
    PREFIX() {
      return 'b_p'
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
}