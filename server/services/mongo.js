/*
Copyright 2017 Keyhole Software LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

const MongoClient = require('mongodb').MongoClient;
const config = require('../config');

const url = config.mongodb;

module.exports = {
    Get: Get,
    GetCI: GetCI,
    GetSort: GetSort,
    GetSortByChunk: GetSortByChunk,
    GetCount: GetCount,
    Insert: Insert,
    Delete: Delete,
    DeleteOne: DeleteOne,
    Update: Update,
    Aggregate: Aggregate
};

const MSG_CONNECTION_ERROR = 'Failed to Connect to MongoDB ';

function Get(query, collectionName) {
    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve, reject) {
        return MongoClient.connect(url, function (err, db) {
            if (err) {
                reject(MSG_CONNECTION_ERROR, err);
            }

            resolve(db.collection(collectionName).find(query).toArray());
        });
    });
}

// Carry out case-insensitive find
function GetCI(query, sort, collectionName) {
    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve, reject) {
        return MongoClient.connect(url, function (err, db) {
            if (err) {
                reject(MSG_CONNECTION_ERROR, err);
            }

            resolve(db.collection(collectionName).find(query).sort(sort).collation({
                locale: 'en',
                strength: 1
            }).toArray());
        });
    });
}

function GetSort(query, sort, collectionName) {
    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve, reject) {
        return MongoClient.connect(url, function (err, db) {
            if (err) {
                reject(MSG_CONNECTION_ERROR, err);
            }

            resolve(db.collection(collectionName).find(query).sort(sort).toArray());
        });
    });
}

function GetSortByChunk(query, sort, collectionName, limitCount, skipCount) {
    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve, reject) {
        return MongoClient.connect(url, function (err, db) {
            if (err) {
                reject(MSG_CONNECTION_ERROR, err);
            }

            resolve(db.collection(collectionName).find(query).sort(sort).skip(skipCount).limit(limitCount).toArray());
        });
    });
}

function GetCount(query, collectionName) {
    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve, reject) {
        return MongoClient.connect(url, function (err, db) {
            if (err) {
                reject(MSG_CONNECTION_ERROR, err);
            }

            db.collection(collectionName).find(query).count().then(function (count) {
                resolve(String(count));
            })
        });
    });
}

function Aggregate(query, collectionName) {
    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve, reject) {
        return MongoClient.connect(url, function (err, db) {
            if (err) {
                reject(MSG_CONNECTION_ERROR, err);
            }

            resolve(db.collection(collectionName).aggregate(query).toArray());
        });
    });
}

function Delete(query, collectionName) {
    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve, reject) {
        return MongoClient.connect(url, function (err, db) {
            if (err) {
                reject(MSG_CONNECTION_ERROR, err);
            }

            resolve(db.collection(collectionName).deleteMany(query));
        });
    });
}

function DeleteOne(query, collectionName) {
    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve, reject) {
        return MongoClient.connect(url, function (err, db) {
            if (err) {
                reject(MSG_CONNECTION_ERROR, err);
            }

            resolve(db.collection(collectionName).deleteOne({"id": query}));
        });
    });
}

function Insert(query, collectionName) {
    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve, reject) {
        return MongoClient.connect(url, function (err, db) {
            if (err) {
                reject(MSG_CONNECTION_ERROR, err);
            }

            resolve(db.collection(collectionName).insert(query));
        });
    });
}

function Update(query, data, collectionName, options) {
    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve, reject) {
        return MongoClient.connect(url, function (err, db) {
            if (err) {
                reject(MSG_CONNECTION_ERROR, err);
            }

            resolve(db.collection(collectionName).update(query, data, options));
        });
    });
}


