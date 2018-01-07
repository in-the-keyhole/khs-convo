### MongoDb configuration 
KHS{convo} requires a MongoDB instance to run. When started against a new instance, required collections will be created. 

A MongoDb connection URI can be supplied as an environrment variable, or in the `server/config/index.ja` property config script. Here's the entry for the DB URI. 

    ...
    mongodb: process.env.MONGODB_URI || 'mongodb://<your instance uri here>',
    ...

You can also set the process.env.MONGODB_URI from a command shell, using a process.env variable.


### [Back to Main](/readme.md) 