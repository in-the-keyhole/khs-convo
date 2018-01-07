### MongoDb configuration 
KHS{convo} requires a MongoDB instance to run. When started against a new instance, required collections will be created. 

A MongoDb connection URI can be supplied as an environrment variable, or in the `server/config/index.ja` property config script. Here's the entry for the DB URI. 

    ...
    mongodb: process.env.MONGODB_URI || 'mongodb://heroku_910tmns5:bq9qnrcmhhrpm4mjdi7tuq8kt7@ds155192.mlab.com:55192/heroku_910tmns5',
    ...

You can also set the process.env.MONGODB_URI from a command shell.


### [Back to Main](/readme.md) 