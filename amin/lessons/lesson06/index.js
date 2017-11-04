'use strict'

const client = new require('elasticsearch').Client({
  host: 'localhost:9200',
  log: 'error'
})

const body = [
  {index: {_index: 'users', _type: 'user', _id: 1}},
  {
    name: 'Reza Gholamzadeh',
    dob: '1987/05/13',
    type: 'user'
  },
  {index: {_index: 'users', _type: 'user', _id: 2}},
  {
    name: 'Ali Alizadeh',
    dob: '1980/12/17',
    type: 'user'
  },
  {index: {_index: 'users', _type: 'user', _id: 3}},
  {
    name: 'Mahmoud Rajabi',
    dob: '1984/01/21',
    type: 'user'
  },
  {index: {_index: 'users', _type: 'user', _id: 4}},
  {
    name: 'Mehrnoosh Ramezanpoor',
    dob: '1992/06/16',
    type: 'user'
  },
  {index: {_index: 'users', _type: 'user', _id: 5}},
  {
    name: 'Nima Abbasi',
    dob: '1988/08/13',
    type: 'user'
  },
  {index: {_index: 'users', _type: 'user', _id: 6}},
  {
    name: 'Amin Forouzandeh',
    dob: '1987/03/02',
    type: 'user'
  },
  {index: {_index: 'users', _type: 'user', _id: 7}},
  {
    name: 'Sara Abbasi',
    dob: '1990/09/11',
    type: 'user'
  },
  {index: {_index: 'users', _type: 'user', _id: 8}},
  {
    name: 'Amin Abbasi',
    dob: '1987/04/24',
    type: 'user'
  },
  {index: {_index: 'users', _type: 'user', _id: 9}},
  {
    name: 'Fereshteh Rahbari',
    dob: '1988/08/15',
    type: 'user'
  },
  {index: {_index: 'users', _type: 'user', _id: 10}},
  {
    name: 'Ramin Mohammadi',
    dob: '1989/11/05',
    type: 'user'
  },
  {index: {_index: 'books', _type: 'book', _id: 1}},
  {
    name: 'wolf',
    type: 'book'
  },
  {index: {_index: 'books', _type: 'book', _id: 2}},
  {
    name: 'old wolf',
    type: 'book'
  }
]

const argv = require('yargs')
  .usage(`$0 delete-indices
          $0 create-indices
          $0 create-docs
          $0 search-all-user
          $0 search-user-name --[name]
          $0 search-user-name-fuzzy --[name]
          $0 search-user-date --[dateFrom] --[dateTo]
          $0 search-user-date-fuzzy --[name] --[dateFrom] --[dateTo]
          $0 search-book-name --[name]`)
  .alias('n', 'name')
  .alias('f', 'dateFrom')
  .alias('t', 'dateTo')
  .command({
    command: 'delete-indices',
    aliases: 'di',
    builder: {},
    desc: 'Deletes all indices form elasticsearch.',
    handler: () => {
      if (client.indices.exists({index: 'books'})) {
        client.indices.delete({
          index: 'books'
        }, (err, res) => {
          if (err) {
            console.log(`\n---------ERROR IN DELETE:\n${JSON.stringify(err, null, 2)}`)
          } else {
            console.log(`\n---------DELETE BOOKS INDEX:\n${JSON.stringify(res, null, 2)}`)
          }
        })
      }

      if (client.indices.exists({index: 'users'})) {
        client.indices.delete({
          index: 'users'
        }, (err, res) => {
          if (err) {
            console.log(`\n---------ERROR IN DELETE:\n${JSON.stringify(err, null, 2)}`)
          } else {
            console.log(`\n---------DELETE USER INDEX:\n${JSON.stringify(res, null, 2)}`)
          }
        })
      }
    }
  })

  .command({
    command: 'create-indices',
    aliases: 'ci',
    builder: {},
    desc: 'Creates "users" & "books" indices.',
    handler: () => {
      client.indices.create({
        index: 'users',
        // body: {
        //   mappings: {
        //     users: {
        //       properties: {
        //         name: {
        //           type: 'string'
        //         },
        //         dob: {
        //           type: 'string'
        //         }
        //       }
        //     }
        //   }
        // }
      }, (err, res) => {
        if (err) {
          console.log(`\n---------ERROR IN CREATE INDICES:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------SUCCESS IN CREATE INDICES:\n${JSON.stringify(res, null, 2)}`)
        }
      })

      client.indices.create({
        index: 'books',
        body: {
          mappings: {
            books: {
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
          console.log(`\n---------ERROR IN CREATE INDICES:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------SUCCESS IN CREATE INDICES:\n${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  })

  .command({
    command: 'create-docs',
    aliases: 'cd',
    builder: {},
    desc: 'Creates 10 docs in "users" & 2 docs "books" indices.',
    handler: () => {
      client.bulk({
        body: body
      }, (err, res) => {
        if (err) {
          console.log(`\n---------ERROR IN DOCS:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------SUCCESS IN CREATE ALL DOCS:\n${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  })

  .command({
    command: 'search-all-user',
    aliases: 'sau',
    builder: {},
    desc: 'Returns all users from index.',
    handler: () => {
      client.search({
        index: 'users',
        query: {
          type: 'user'
        }
      }, (err, res) => {
        if (err) {
          console.log(`\n---------ERROR IN DOCS:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------ALL USERS:\n${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  })

  .command({
    command: 'search-user-name',
    aliases: 'sun',
    builder: (argv) => argv.demandOption('n'),
    desc: 'Returns users with specified name from "users".',
    handler: (argv) => {
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
          console.log(`\n---------ERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------LIST OF USERS WITH NAME='${argv.name}':\n
          ${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  })

  .command({
    command: 'search-user-name-fuzzy',
    aliases: 'sunf',
    builder: (argv) => argv.demandOption('n'),
    desc: 'Returns users with specified name from "users" using "fuzzy".',
    handler: (argv) => {
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
          console.log(`\n---------ERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------LIST OF FUZZY 'USERS' WITH NAME='${argv.name}':\n
          ${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  })

  .command({
    command: 'search-user-date',
    aliases: 'sud',
    builder: (argv) => argv.demandOption(['f', 't']),
    desc: 'Returns users with specified date-of-birth range.',
    handler: (argv) => {
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
          console.log(`\n---------ERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------LIST OF 'USERS' WITH BIRTHDAY RANGE:
          [${argv.dateFrom}, ${argv.dateTo}]:\n${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  })

  .command({
    command: 'search-user-date-fuzzy',
    aliases: 'sudf',
    builder: (argv) => argv.demandOption(['n', 'f', 't']),
    desc: 'Returns users with specified date-of-birth range using "fuzzy".',
    handler: (argv) => {
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
          console.log(`\n---------ERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------LIST OF 'USERS' WITH BIRTHDAY RANGE (FUZZY):
          [${argv.dateFrom}, ${argv.dateTo}]:\n${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  })

  .command({
    command: 'search-book-name',
    aliases: 'sbn',
    builder: (argv) => argv.demandOption('n'),
    desc: 'Returns books with exact name from "books" index.',
    handler: (argv) => {
      client.search({
        index: 'books',
        //type: 'book',
        body: {
          filter: {
            term: {
              name: argv.n
            }
          }
        }
      }, (err, res) => {
        if (err) {
          console.log(`\n---------ERROR IN SEARCH:\n${JSON.stringify(err, null, 2)}`)
        } else {
          console.log(`\n---------LIST OF 'BOOKS' WITH NAME='${argv.name}':\n
          ${JSON.stringify(res, null, 2)}`)
        }
      })
    }
  })
  .help()
  .argv
