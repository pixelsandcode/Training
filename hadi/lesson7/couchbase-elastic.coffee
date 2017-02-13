elasticsearch = require('elasticsearch')
client = new elasticsearch.Client
  host: 'localhost:9200'
  log: 'trace'

base = require('odme').Base
couchbase = require('couchbase')
cluster = new couchbase.Cluster()


argv = require('yargs')
.usage('usage: \n
                 $0 create-index \n
                 $0 insert --name [name] --dob [date (ex. 1990-01-01)] \n
                 $0 search-exact --name [name] (If you want search a phrase put it on double quotes)\n ')
.help()
.argv

class User extends base
  PREFIX: 'u'
  props:
    name: true
    dob: true
    total_logins: false
  _mask: 'name,dob'


switch argv._[0]
  when 'create-index'
    client.indices.create
      index: 'my-index'
      body:
        mappings:
          users:
            properties:
              doc:
                properties:
                  name:
                    type: 'string'
                    index: 'not_analyzed'
                  dob:
                    type: 'string'
      (err, res) ->
        if err
          console.log err.message
        else
          console.log res
  when 'insert'
    if argv.name != undefined & argv.name != true & argv.dob != undefined & argv.dob != true
      bucket = cluster.openBucket()
      usr = new User {name: argv.name , dob: argv.dob , total_logins: 10}
      bucket.upsert usr.key, usr.doc , (err,result) ->
        try
          console.log 'document saved'
          bucket.disconnect()
        catch err
          console.log err.message
          bucket.disconnect()
    else
      console.log 'Command not found. To view a list of available commands, use the --help flag with major command'
  when 'search'
    if argv.name != undefined & argv.name != true
      client.search
        index: 'my-index'
        type: 'users'
        body:
          query:
            term:
              name: argv.name
    else
      console.log 'Command not found. To view a list of available commands, use the --help flag with major command'
  else
    console.log 'Command not found. To view a list of available commands, use the --help flag with major command'

###
client.indices.putMapping
  index: 'test4'
  type: 'users'
  body:
    properties:
      doc:
        properties:
          name:
            type: 'string'
            index: 'not_analyzed'
          dob:
            type: 'date'
  (err, res) ->
    if err
      console.log err.message
    else
      console.log res
###
