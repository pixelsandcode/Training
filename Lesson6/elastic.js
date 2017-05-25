const argv = require('yargs')

.usage(
`
$0 create-indices
$0 create-docs
$0 search-all-user
$0 search-user-name --[name]
$0 search-user-name-fuzz --[name]
$0 search-user-daterange --[range1] --[range2]
$0 search-user-name-daterange-fuzz --[name] --[range1] --[range2]
$0 delete-indices
$0 search-book-name --[name]
`)





.command({
  command: 'create-indices',
  aliases: 'cri',
  desc: 'Creates two indices, book and user.'
})

.command({
  command: 'create-docs',
  aliases: 'crd',
  desc: 'Creates 10 user and 2 book.'
})

.command({
  command: 'search-all-user',
  aliases: 'sau',
  desc: 'Searches all users.'
})

.command({
  command: 'search-user-name',
  aliases: 'sun',
  desc: 'Searches users by name.',
  builder: (argv) => argv.demandOption('n')
})

.alias('n', 'name')

.command({
  command: 'search-user-name-fuzz',
  aliases: 'sunf',
  desc: "Searches users by name using fuzzy.",
  builder: (argv) => argv.demandOption('n')
})

.command({
  command: 'search-user-daterange',
  aliases: 'sud',
  desc: 'Searches users by daterange.',
  builder: (argv) => argv.demandOption(['s', 'e'])
})

.alias('s', 'range1')
.alias('e', 'range2')

.command({
  command: 'search-user-name-daterange-fuzz',
  aliases: 'sundaf',
  desc: 'Searches users by name and daterange using executing filters.',
  builder: (argv) => argv.demandOption(['n', 's', 'e'])
})

.command({
  command: 'delete-indices',
  aliases: 'din',
  desc: 'Deletes all indices that had been created.'
})

.command({
  command: 'search-book-name',
  aliases: 'sbon',
  desc: 'Searches books by name.',
  builder: (argv) => argv.demandOption('n')
})

.help('h')
.alias('h', 'help')
.argv

const elasticsearch = require('elasticsearch')
const Client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
})
switch (argv._[0]) {

  case 'create-indices':
  case 'cri':

    Client.indices.create({
      index: 'user'
    })

    Client.indices.create({
      index: 'book',
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
    })

    break

  case 'create-docs':
  case 'crd':

    Client.bulk({
      body: [{
        index: {
          _index: 'user',
          _type: 'user',
          _id: 1
        }
      }, {
        name: 'nader',
        DOB: '1376-02-20',
        type: 'user'
      }, {
        index: {
          _index: 'user',
          _type: 'user',
          _id: 2
        }
      }, {
        name: 'amir',
        DOB: '1369-11-15',
        type: 'user'
      }, {
        index: {
          _index: 'user',
          _type: 'user',
          _id: 3
        }
      }, {
        name: 'reza',
        DOB: '1360-05-19',
        type: 'user'
      }, {
        index: {
          _index: 'user',
          _type: 'user',
          _id: 4
        }
      }, {
        name: 'hadi',
        DOB: '1355-06-11',
        type: 'user'
      }, {
        index: {
          _index: 'user',
          _type: 'user',
          _id: 5
        }
      }, {
        name: 'arash',
        DOB: '1340-02-02',
        type: 'user'
      }, {
        index: {
          _index: 'user',
          _type: 'user',
          _id: 6
        }
      }, {
        name: 'mahdiye',
        DOB: '1375-01-01',
        type: 'user'
      }, {
        index: {
          _index: 'user',
          _type: 'user',
          _id: 7
        }
      }, {
        name: 'amirali',
        DOB: '1376-08-29',
        type: 'user'
      }, {
        index: {
          _index: 'user',
          _type: 'user',
          _id: 8
        }
      }, {
        name: 'mehrnosh',
        DOB: '1375-05-16',
        type: 'user'
      }, {
        index: {
          _index: 'user',
          _type: 'user',
          _id: 9
        }
      }, {
        name: 'ashkan',
        DOB: '1360-06-19',
        type: 'user'
      }, {
        index: {
          _index: 'user',
          _type: 'user',
          _id: 10
        }
      }, {
        name: 'yaser',
        DOB: '1383-11-22',
        type: 'user'
      }, {
        index: {
          _index: 'book',
          _type: 'book',
          _id: 1
        }
      }, {
        name: 'wolf',
        type: 'book'
      }, {
        index: {
          _index: 'book',
          _type: 'book',
          _id: 2
        }
      }, {
        name: 'oldwolf',
        type: 'book'
      }, ]
    }, (error, response) => {
      if (error) {
        console.error(error.message)
      } else {
        console.log(response)
      }
    })

    break

  case 'delete-indices':
  case 'din':

    Client.indices.delete({
      index: ['user', 'book']
    }, (error, response) => {
      if (error) {
        console.error(error.message)
      } else {
        console.log(response)
      }
    })

    break

  case 'search-all-user':
  case 'sau':

    Client.search({
      index: 'user',
      q: 'type:user'
    }, (error, response) => {
      if (error) {
        console.error(error.message)
      } else {
        console.log(response)
      }
    })

    break

  case 'search-user-name':
  case 'sun':

    Client.search({
      index: 'user',
      type: 'user',
      body: {
        query: {
          match: {
            name: argv.n
          }
        }
      }
    }, (error, response) => {
      if (error) {
        console.error(error.message)
      } else {
        console.log(response)
      }
    })

    break

  case 'search-user-name-fuzz':
  case 'sunf':

    Client.search({
      index: 'user',
      type: 'user',
      body: {
        query: {
          fuzzy: {
            name: {
              value: argv.n,
              fuzziness: 6,
              prefix_length: 0,
              max_expansions: 50
            }
          }
        }
      }
    }, (error, response) => {
      if (error) {
        console.error(error.message)
      } else {
        console.log(response)
      }
    })

    break

  case 'search-user-daterange':
  case 'sud':

    Client.search({
      index: 'user',
      type: 'user',
      body: {
        query: {
          range: {
            DOB: {
              gte: argv.s,
              lte: argv.e
            }
          }
        }
      }
    }, (error, response) => {
      if (error) {
        console.error(error.message)
      } else {
        console.log(response)
      }
    })

    break

  case 'search-user-name-daterange-fuzz':
  case 'sundaf':

    Client.search({
      index: 'user',
      type: 'user',
      body: {
        query: {
          filtered: {
            query: {
              fuzzy: {
                name: {
                  value: argv.n,
                  fuzziness: 6,
                  prefix_length: 0,
                  max_expansions: 50
                }
              }
            },
            filter: {
              range: {
                DOB: {
                  gte: argv.s,
                  lte: argv.e
                }
              }
            }
          }
        }
      }
    }, (error, response) => {
      if (error) {
        console.error(error.message)
      } else {
        console.log(response)
      }
    })

    break

  case 'search-book-name':
  case 'sbon':
    Client.search({
      index: 'book',
      body: {
        query: {
          match: {
            name: argv.n
          }
        }
      }
    }, (error, response) => {
      if (error) {
        console.error(error.message)
      } else {
        console.log(response)
      }
    })

    break

  default:
    console.log(
      `command not founde. please run [node elastic.js --help] `)

}
