# Lesson9

## start
  run gulp for help.
  run gulp start for starting the server.

## index.js

  This file can:
    1. can make an elasticsearch index with specified mapping.
    2. can create post_1 doc in couchbase bucket.
    3. can query a doc from couchbase bucket with docKey.

## server.js

  This file is:
    The main API run it up and take a look at http://localhost:8080/docs for help.

## couchbase elasticsearch data replication

  same as lesson7 but this time add: couchbase.typeSelector.documentTypesRegex.post: ^post_.+$
  to your elasticsearch.yml.
