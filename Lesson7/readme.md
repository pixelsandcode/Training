#lesson 7
This is my lesson7 answer.

1. first of all you should add these line to your elasticsearch.yml :

couchbase.typeSelector: org.elasticsearch.transport.couchbase.capi.RegexTypeSelector
couchbase.typeSelector.documentTypesRegex.user: ^u_.+$

note:( ^u_.+$ ) is regular-expressions.
elasticsearch.yml is at root/etc/elasticsearch directory.

2. Create an index in elasticsearch using the `node cobastic.js ci` command, name of the index is cobastic.

3. Navigate to the Couchbase Server admin interface.

4. Select the XDCR tab.

5. Press the button labeled "Create Cluster Reference".

6. Choose a name for your Elasticsearch cluster.

7. In the IP/Hostname and field provide an address and port of one of the nodes in your ES cluster (127.0.0.1:9091).

8. Enter the Username and Password corresponding to your "couchbase.username" and "couchbase.password" settings in Elasticsearch.

9. Press the "Save" button.

10. Press the button labeled "Create Replication".

11. Select the bucket from source cluster you wish to send to Elasticsearch.

12. select the cluster you defined in step 6.

13. Type in the name of Elasticsearch index cobastic as we Create it in step 2.

14. If you are using Couchbase Server 2.2 or later, click Advanced settings and change the XDCR Protocol setting to Version 1.

15. you can create and delete the cobastic index, insert a document to couchbase cluster and search it from elasticsearch cobastic index by cobastic.js.

for more information how to use cobastic.js run this command:

`node cobastic.js -h`
