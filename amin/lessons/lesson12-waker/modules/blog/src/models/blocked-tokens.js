"use strict"

module.exports = (server, options) => {
  return class blockedTokens extends server.methods.model.base('application') {
    PREFIX() {
      return 'b_jwt'
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
}