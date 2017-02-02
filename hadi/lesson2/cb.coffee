couchbase = require('couchbase')
cluster = new couchbase.Cluster()
bucket = cluster.openBucket('default')

argv = require('yargs')
  .usage('usage: $0 save -n [name] -a [num] \n or: $0 get --name [name]')
  .command
    command: 'save'
    desc: 'save given document in couchbase server'
    handler: (argv) -> bucket.upsert argv.n , {name: argv.n, age: argv.a}, (err, result) ->
      try
        console.log "document saved"
      catch err
        console.log err.message
      bucket.disconnect()
  .command
    command: 'get'
    desc: 'retrieve specified document from couchbase server'
    handler: (argv) -> bucket.get argv.name , (err, result) ->
      try
        console.log result.value
      catch err
        console.log "requested document does not exist"
      bucket.disconnect()
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv

