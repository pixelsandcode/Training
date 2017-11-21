module.exports = (client, User) => {
  return {
    delete_index: () => {
      if (client.indices.exists({index: 'users'})) {
        client.indices.delete({
          index: 'users'
        }, (err, res) => {
          if (err) {
            console.log(`\nERROR IN DELETE:\n${JSON.stringify(err, null, 2)}`)
          } else {
            console.log(`\nDELETE USER INDEX:\n${JSON.stringify(res, null, 2)}`)
          }
        })
      }
    },
    create_index: () => {
      client.indices.create({
        index: 'users',
        body: {
          mappings: {
            user: {
              properties: {
                doc: {
                  properties: {
                    name: {
                      type: 'string',
                      index: 'not_analyzed'
                    },
                    dob: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }, (err, res) => {
        if (err) {
          console.log(`\nERROR IN CREATE INDICES:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\nSUCCESS IN CREATE INDICES:\n${JSON.stringify(res, null, 2)}`)
        }
      })
    },
    create_user: (argv) => {
      const user = new User({
        name: argv.name,
        dob: argv.dob
      })
      user.create(true).then((res) => {
          console.log(`\nADD NEW USER:\n${JSON.stringify(res, null, 2)}`)
        }
      )
    },
    search_all: () => {
      client.search({
        index: 'users',
        type: 'user',
        query: {
          match_all: {}
        }
      }, (err, res) => {
        if (err) {
          console.log(`\nERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\nALL USERS:\n${JSON.stringify(res.hits.hits, null, 2)}`)
        }
      })
    },
    search_user: (argv) => {
      client.search({
        index: 'users',
        type: 'user',
        body: {
          filter: {
            term: {
              "doc.name": argv.name
            }
          }
        }
      }, (err, res) => {
        if (err) {
          console.log(`\nERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\nUSERS WITH NAME='${argv.name}':\n${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  }
}