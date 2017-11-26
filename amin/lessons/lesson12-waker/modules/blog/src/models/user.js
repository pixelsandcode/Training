"use strict"

module.exports = (server, options) => {
  return class User extends server.methods.model.base('application') {
    PREFIX() {
      return 'b_u'
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
}