#!/usr/bin/env node

var argv = require('yargs');
var couchbase = require('couchbase');
var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
var bucket = cluster.openBucket('default');
argv

.usage("$0 save --name=[name] --age=[age]" + '\n' + "$0 get --name=[docID]")

.alias('n', 'name')
.alias('a', 'age')

.command({
  command: 'save',
  desc: 'Saves the document in couchbase.',
  builder: (argv) => argv.demandOption(['name', 'age']),
  handler: (argv) => {
    bucket.upsert(argv.name, {
      name: argv.name,
      age: argv.age
    }, function(err, result) {
      if (!err) {
        console.log('doc saved');
        bucket.disconnect();
      } else {
        console.error('doc didnt saved');
        bucket.disconnect();
      }
    })
  }
})

.command({
  command: 'get',
  desc: 'Gets the document from couchbase and print it in teminal.',
  builder: (argv) => argv.demandOption('name'),
  handler: (argv) => {
    bucket.get(argv.name, function(err, result) {
      if (!err) {
        console.log(result.value);
        bucket.disconnect();
      } else {
        console.error("can't get the doc!");
        bucket.disconnect();
      }
    })
  }
})

.help()

.argv
