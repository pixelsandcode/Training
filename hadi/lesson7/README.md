Usage:
1. Create a custom mapping using elasticsearch config file to map u_randomID to users.
    Config file could be in: "/etc/elasticsearch/elasticsearch.yml"
    Add these lines to config file:
    couchbase.typeSelector: org.elasticsearch.transport.couchbase.capi.RegexTypeSelector
    couchbase.typeSelector.documentTypesRegex.users: ^u_(.)+$
2. Create an Elasticsearch index by following command:
    "coffee couchbase-elastic.coffee create-index"
3.  Navigate to the Couchbase Server admin interface.
4.  Select the Replications tab.
5.  Press the button labeled "Create Cluster Reference"
6.  Choose a name for your Elasticsearch cluster
7.  In the IP/Hostname and field provide an address and port of one of the nodes in your ES cluster (127.0.0.1:9091)
8.  Enter the Username and Password corresponding to your "couchbase.username" and "couchbase.password" settings in Elasticsearch
9.  Press the "Save" button
10.  Press the button labeled "Create Replication"
11. Select the bucket from source cluster you wish to send to Elasticsearch
12. Next select the cluster you defined in step 5.
13. Type in the name of the Elasticsearch index (in this project: "my-index")you wish to store the data in. This index must already exist.
14. If you are using Couchbase Server 2.2 or later, click Advanced settings and change the XDCR Protocol setting to Version 1
15. Insert new doc into couchbase database by following command, insertes doc will replicate in elasticsearch cluster
     "coffee couchbase-elastic.coffee insert --name [name] --dob [date (ex. 1990-01-01)]"
16. You can search by exact name using following command:
     "coffee couchbase-elastic.coffee search-exact --name [name]" (If you want search a phrase put it on double quotes)"
