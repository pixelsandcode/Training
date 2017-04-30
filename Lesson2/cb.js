#!/usr/bin/env node
var argv = require('yargs');
var couchbase = require('couchbase');
var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
var bucket = cluster.openBucket('default');
argv
.usage("$0 save -n=[name] -a=[age]" + '\n' + "$0 get -n=[docID]")
.command({
  command: 'save',
  desc: 'save a doc in couchbase',
  builder: (argv) => argv.demandOption(['n','a']),
  handler: (argv) => {
    bucket.upsert(argv.n, {name: argv.n, age: argv.a}, function(err, result){if (!err) {
      console.log('doc saved');
      bucket.disconnect();
    }else{
      console.error('doc didnt saved');
      bucket.disconnect();}
    })
   }
  })
.command({
  command: 'get',
  desc: 'get the doc from couchbase and print it in teminal.',
  builder: (argv) => argv.demandOption('n'),
  handler: (argv) => {
    bucket.get(argv.n, function(err, result) {
      if(!err) {
      console.log(result.value);
      bucket.disconnect();
    } else {
      console.error("can't get the doc!");
      bucket.disconnect();}
    })
  }
})
.help()
.argv
