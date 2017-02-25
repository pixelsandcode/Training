should = require('chai').should()
uuid   = require 'node-uuid'
Q = require('q')

host = 'localhost'
name = 'tipi'

describe 'Puffer', ->
  
  doc1Id = "puffer:#{uuid.v1()}"
  doc11Id = "puffer:#{uuid.v1()}"
  doc1   = { color: 'red' }
  doc2Id = "puffer:#{uuid.v1()}"
  doc2   = { color: 'blue' }
  doc3Id = "puffer:#{uuid.v1()}"
  doc3   = { color: 'green' }
  puffer = new require('../build/main') { host: host, name: name }, true 
  
  it "should connect to cluster with only name", ->
    db = new require('../build/main') { host: host, name: name }, true
    Q.delay(10).then ->
      db.bucket.should.have.property('connected').that.equals true
  
  it "should connect to cluster with password", ->
    db = new require('../build/main') { host: host, name: name, password: 'test' }, true
    Q.delay(10).then ->
      db.bucket.should.have.property('connected').that.equals true

  it "should connect to more than one bucket", ->
    db1 = null
    db2 = null
    fn2 = ->
      instances = new require('../build/main').instances
      instances.should.contain.keys ['tipi', 'analytics']
      db2.bucket.should.have.property('connected').that.equals true
    fn1 = ->
      db1.bucket.should.have.property('connected').that.equals true
      db2 = new require('../build/main') { host: host, name: 'analytics', callback: fn2 }, true

    db1 = new require('../build/main') { host: host, name: 'tipi', callback: fn1 }, true
  
  it "should connect to cluster with callback", ->
    db = null
    fn = ->
      db.bucket.should.have.property('connected').that.equals true
    db = new require('../build/main') { host: host, name: name, callback: fn }, true
  
  it "should insert and get a document", ->
    puffer.insert( doc1Id, doc1 )
      .then(
        (d) ->
          puffer.get( doc1Id )
            .then (d) ->
              d.should.be.an 'object'
              d.value.should.have.property('color').that.equals('red')
      )

  it "should insert and get a document with options", ->
    puffer.insert( doc1Id, doc1, { expiry: 5 } )
      .then(
        (d) ->
          puffer.get( doc1Id )
            .then (d) ->
              d.should.be.an 'object'
              d.value.should.have.property('color').that.equals('red')
              Q.delay(20).then(
                -> puffer.get( doc1Id ).then(
                    (d) ->
                      d.should.be.instanceof Error
                   )
              ).done()
      )

  it "should get only value part of a document", ->
    puffer.get( doc1Id, true )
      .then (d) ->
        d.should.have.property('color').that.equals('red')
    
  it "should get only value part of multi documents", ->
    puffer.insert( doc2Id, doc2 ).then(
      (d) ->
        puffer.get( [doc1Id, doc2Id], true )
          .then (d) ->
            d.should.eql [ { color: 'red' }, { color: 'blue' } ]
    )
    
  it 'should replace a document with a new one', ->
    puffer.replace( doc1Id, { city: 'Tehran' } )
      .then(
        (d) ->
          puffer.get( doc1Id )
            .then (d) ->
              d.should.be.an 'object'
              d.value.should.have.property('city').that.equals('Tehran')
      )

  it 'should fail replacing a document with different CAS', ->
    puffer.insert( doc11Id, doc1 ).then ->
      puffer.get(doc11Id).then (d) ->
        cas = d.cas
        puffer.replace( doc11Id, { city: 'Tehran' } )
          .then(
            (d) ->
              puffer.replace( doc11Id, { city: 'Tehran' }, { cas: cas } )
                .then (d) -> 
                  d.should.be.instanceof Error
          ).done()
    
  it 'should delete a document', ->
    puffer.remove( doc1Id )
      .then(
        (d) ->
          puffer.get( doc1Id )
            .then (d) ->
              d.output.should.have.deep.property('statusCode').that.equals(503)
      )
    puffer.remove( doc3Id )
      .then(
        (d) ->
          puffer.get( doc3Id )
            .then (d) ->
              d.output.should.have.deep.property('statusCode').that.equals(503)
      )

  it 'should update a document partially', ->
    id = 'u1'
    puffer.insert( id, { name: 'Arash' } ).then(
      -> puffer.update( id, { age: 31 }).then(
          -> puffer.get(id).then (d) -> d.value.should.eql { name: 'Arash', age: 31 }
        )
    )
    id2 = 'u2'
    puffer.insert( id2, { name: 'Jack' } ).then(
      -> puffer.update( id2, { name: 'Arash', age: 31 }).then(
          -> puffer.get(id2).then (d) -> d.value.should.eql { name: 'Arash', age: 31 }
        )
    )

  it 'should update a document based on passed method', ->
    id = 'u3'
    m = (doc) ->
      doc.age = 31
      doc.lastname = 'Smith'
      doc
    puffer.insert( id, { name: 'Jack', age: 35 } ).then(
      -> puffer.update( id, m).then(
          -> puffer.get(id).then (d) -> d.value.should.eql { name: 'Jack', age: 31, lastname: 'Smith' }
        )
    )
