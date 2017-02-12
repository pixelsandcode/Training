elasticsearch = require('elasticsearch')
client = new elasticsearch.Client
  host: 'localhost:9200'
  log: 'trace'

argv = require('yargs')
  .usage('usage: \n
                 $0 create-users-books \n
                 $0 search-all \n
                 $0 search --name [name] \n
                 $0 search-fuz --name [name] \n
                 $0 search-range --range1 [date (ex. 1990-03-23)] --range2 [date]\n
                 $0 search-fuz-range --name [name] --range1 [date] --range2 [date] \n
                 $0 search-exact --bookName [name] \n ')
  .help()
  .argv

# in following methods we can skip callback to get promise
###
client.ping requestTimeout: Infinity, (err) ->
  if err
    console.log 'elasticsearch cluster is down'
  else
    console.log 'all is well'
###

switch argv._[0]
  when "create-users-books"
    # creating users index
    client.indices.create
      index: 'users'

    # creating docs
    client.bulk body: [
      { index:
        _index: 'users'
        _type: 'user'
        _id: 1 }
      {
        name: 'hadi abedi'
        dob: '1987-03-23'
      }

      { index:
        _index: 'users'
        _type: 'user'
        _id: 2 }
      { name: 'reza gholamzadeh', dob: '1987-05-27' }

      { index:
        _index: 'users'
        _type: 'user'
        _id: 3 }
      { name: 'danial', dob: '1995-08-22' }

      { index:
        _index: 'users'
        _type: 'user'
        _id: 4 }
      { name: 'amir', dob: '1992-07-12' }

      { index:
        _index: 'users'
        _type: 'user'
        _id: 5 }
      { name: 'arash', dob: '1985-07-11' }

      { index:
        _index: 'users'
        _type: 'user'
        _id: 6 }
      { name: 'shakib', dob: '1996-07-01' }

      { index:
        _index: 'users'
        _type: 'user'
        _id: 7 }
      { name: 'morteza', dob: '1992-06-22' }

      { index:
        _index: 'users'
        _type: 'user'
        _id: 8 }
      { name: 'ashkan', dob: '1986-07-02' }

      { index:
        _index: 'users'
        _type: 'user'
        _id: 9 }
      { name: 'amirali', dob: '1991-03-21' }

      { index:
        _index: 'users'
        _type: 'user'
        _id: 10 }
      { name: 'ahmad', dob: '1990-07-01' }


      { update:
        _index: 'users'
        _type: 'user'
        _id: '10' }
      {
        doc:
          name: 'ali'
      }

   ]

    # creating books index
    client.indices.create
      index: 'books'
      body:
        mappings:
          book:
            properties:
              name:
                type: 'string'
                index: 'not_analyzed'
      (err, res) ->
        if err
          console.log err.message
        else
          console.log res

    client.bulk body: [
      { index:
        _index: 'books'
        _type: 'book'
        _id: 1 }
      {
        name: 'old wolf'
      }

      { index:
        _index: 'books'
        _type: 'book'
        _id: 2 }
      { name: 'wolf' }
    ]

  when 'search-all'
    client.search
      index: 'users'
      type: 'user'
      body:
        query:
          match_all: {}
    (err, res) ->
      if err
        console.log err.message
      else
        console.log res


  when 'search'
    if argv.name != undefined & argv.name != true
      client.search
        index: 'users'
        type: 'user'
        body:
          query:
            match:
              name: argv.name
    else
      console.log 'Command not found. To view a list of available commands, use the --help flag with major command'

  when  'search-fuz'
    if argv.name != undefined & argv.name != true
      client.search
        index: 'users'
        type: 'user'
        body:
          query:
            fuzzy:
              name:
                value: argv.name
                fuzziness: 2
                prefix_length: 0
    else
      console.log 'Command not found. To view a list of available commands, use the --help flag with major command'

  when 'search-range'
    if argv.range1 != undefined & argv.range1 != true & argv.range2 != undefined & argv.range2 != true
      client.search
        index: 'users'
        type: 'user'
        body:
          query:
            range:
              dob:
                gte: argv.range1
                lte: argv.range2
    else
      console.log 'Command not found. To view a list of available commands, use the --help flag with major command'

  when 'search-fuz-range'
    if argv.range1 != undefined & argv.range1 != true & argv.range2 != undefined & argv.range2 != true & argv.name != undefined & argv.name != true
      client.search
        index: 'users'
        type: 'user'
        body:
          query:
            filtered:
              query:
                fuzzy:
                  name: argv.name
              filter:
                range:
                  dob:
                    gte: argv.range1
                    lte: argv.range2
    else
      console.log 'Command not found. To view a list of available commands, use the --help flag with major command'

  when 'search-exact'
    if argv.bookName != undefined & argv.bookName != true
      client.search
        index: 'books'
        type: 'book'
        body:
          query:
            term:
              name: argv.bookName
    else
      console.log 'Command not found. To view a list of available commands, use the --help flag with major command'
  else
    console.log 'Command not found. To view a list of available commands, use the --help flag with major command'

###
# creating a doc
client.index
  index: 'users'
  type: 'user'
  #id: '1' #post method sets a random id
  body:
    name: 'hadi abedi'
    dob: '1987-03-23'

# deleting an index or indices
client.indices.delete
  index: ['user', 'tweets']
  (err, res) ->
    if err
      console.log err.message
    else
      console.log res

# deleting a doc
client.delete
  index: 'users'
  type: 'user'
  id: 'AVosDMoGEIH6S440uWsF'



client.search(q: 'pants').then (body) ->
  hits = body.hits.hits
  (err) ->
    console.trace err.message


client.search
  index: 'twitter'
  type: 'tweet'
  body:
    query:
      match:
        message: 'out elastic'
.then (res) ->
  hits = res.hits.hits
  (err) ->
    console.trace err.message
###






