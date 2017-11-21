module.exports = (client) => {
  const body = require('./body')
  return {
    delete_indices: () => {
      if (client.indices.exists({index: 'books'})) {
        client.indices.delete({
          index: 'books'
        }, (err, res) => {
          if (err) {
            console.log(`\nERROR IN DELETE:\n${JSON.stringify(err, null, 2)}`)
          } else {
            console.log(`\nDELETE BOOKS INDEX:\n${JSON.stringify(res, null, 2)}`)
          }
        })
      }

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
    create_indices: () => {
      client.indices.create({
        index: 'users',
      }, (err, res) => {
        if (err) {
          console.log(`\nERROR IN CREATE INDICES:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\nSUCCESS IN CREATE INDICES:\n${JSON.stringify(res, null, 2)}`)
        }
      })

      client.indices.create({
        index: 'books',
        body: {
          mappings: {
            book: {
              properties: {
                name: {
                  type: 'string',
                  index: 'not_analyzed'
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
    create_docs: () => {
      client.bulk({
        body: body
      }, (err, res) => {
        if (err) {
          console.log(`\nERROR IN DOCS:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\nSUCCESS IN CREATE ALL DOCS:\n${JSON.stringify(res, null, 2)}`)
        }
      })
    },
    search_all: () => {
      client.search({
        index: 'users',
        query: {
          type: 'user'
        }
      }, (err, res) => {
        if (err) {
          console.log(`\nERROR IN DOCS:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\nALL USERS:\n${JSON.stringify(res, null, 2)}`)
        }
      })
    },
    search_user: (argv) => {
      client.search({
        index: 'users',
        type: 'user',
        body: {
          query: {
            match: {
              name: argv.name
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
    },
    search_user_fuzzy: (argv) => {
      client.search({
        index: 'users',
        type: 'user',
        body: {
          query: {
            fuzzy: {
              name: {
                value: argv.name,
              }
            }
          }
        }
      }, (err, res) => {
        if (err) {
          console.log(`\nERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\nFUZZY 'USERS' WITH NAME='${argv.name}':\n${JSON.stringify(res, null, 2)}`)
        }
      })
    },
    search_user_date: (argv) => {
      client.search({
        index: 'users',
        type: 'user',
        body: {
          query: {
            range: {
              dob: {
                gte: argv.f,
                lte: argv.t
              }
            }
          }
        }
      }, (err, res) => {
        if (err) {
          console.log(`\nERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log('\nUSERS WITH BIRTHDAY RANGE:' +
            `[${argv.dateFrom}, ${argv.dateTo}]:\n${JSON.stringify(res, null, 2)}`)
        }
      })
    },
    search_user_date_fuzzy: (argv) => {
      client.search({
        index: 'users',
        type: 'user',
        body: {
          query: {
            filtered: {
              query: {
                fuzzy: {
                  name: {
                    value: argv.n
                  }
                }
              },
              filter: {
                range: {
                  dob: {
                    gte: argv.f,
                    lte: argv.t
                  }
                }
              }
            }
          }
        }
      }, (err, res) => {
        if (err) {
          console.log(`\nERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log('\nUSERS WITH BIRTHDAY RANGE (FUZZY):' +
            `[${argv.dateFrom}, ${argv.dateTo}]:\n${JSON.stringify(res, null, 2)}`)
        }
      })
    },
    search_book: (argv) => {
      client.search({
        index: 'books',
        type: 'book',
        body: {
          filter: {
            term: {
              name: argv.n
            }
          }
        }
      }, (err, res) => {
        if (err) {
          console.log(`\nERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\nBOOKS WITH NAME='${argv.name}':\n${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  }
}
