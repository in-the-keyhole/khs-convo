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
var express = require('express');
var mongo = require('../../services/mongo');
var sendmail = require('sendmail')({silent: false})
var nodemailer = require('nodemailer');

var config = require('../../config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema
var graphql = require('graphql')
var GraphQLObjectType = graphql.GraphQLObjectType
var GraphQLBoolean = graphql.GraphQLBoolean
var GraphQLID = graphql.GraphQLID
var GraphQLString = graphql.GraphQLString
var GraphQLList = graphql.GraphQLList
var GraphQLNonNull = graphql.GraphQLNonNull
var GraphQLSchema = graphql.GraphQLSchema
var uuid = require('uuid');
var _ = require('lodash');
var Loader = require('../../services/eventloader');
var fs = require('fs');

const path = require('path');
const util = require('util');
var events = require('../../services/convo/events');
const smtpUser = config.smtp_user;
const smtpPassword = config.smtp_password;

let platform = process.platform;
let hostPath = '\\convoevents\\';
let hostAdmin = '\\api\\admin';

let serverPath = '/convoevents/';
let serverAdmin = '/api/admin';

function get(req, res) {
    
    mongo.GetSort({}, {LastName: 1, FirstName: 1}, 'Users')
        .then(function (users) {
            
            var visible = _.filter(users, function(user) {
                return user.Status !== 'removed';
            });
            
            res.send(visible); 
        })
}

function blacklistget(req, res) {
    
    mongo.GetSort({}, {phone: 1}, 'Blacklist')
        .then(function (contacts) {
            res.send(contacts); 
        })
}

function contentget(req, res) {
    
    mongo.Get({}, 'Content')
        .then(function (contacts) {
            res.send(contacts); 
        })
}

function post(req, res) {

    req.body.uuid = uuid();
    if (req.body.Email != req.body.ConfirmEmail){
         return res.send("your email addresses are not the same");
    }

   mongo.Get({Username:req.body.Email, Status:{$ne:"removed"}}, "Users" )
   .then (function (response){
  
       if (response.length> 0 ){
           res.send("The email address you have entered is already registered") ;
       }else {
            mongo.Insert(req.body, 'Users')
            .then(function (contact) { 
            });
    
            req.body.RegistrationEmail = req.body.Email;
            return sendRegistrationEmail(req,res );
       }
   })
   .catch (function (error){
        console.log(" duplication check error  "    + error) ;
       
   }); 
}

function blacklistpost(req, res) {
    
    if (req.body.phone) {
        mongo.Insert(req.body, 'Blacklist')
            .then(function (contact) {
                res.send(req.body);
            })
    }
}

function remove(req, res) {
    if (req.body.uuid){
        res.send('delete has been disabled');
/*
        mongo.Delete(req.body, 'Users')
            .then(function (contact) {
                res.send(contact);
            })
            */
    }
}

function blacklistremove(req, res) {
    mongo.Delete(req.body, 'Blacklist')
        .then(function (contact) {
            res.send(contact);
        })
}

function put(req, res) {

    var data = _.omit(req.body, ['_id']);

    mongo.Update({uuid: req.body.uuid}, {$set: data},  'Users')
    .then(function (response) {  
        res.send(response); 
    })  
}

function blacklistput(req, res) {
    mongo.Update({phone: req.body.phone}, req.body,  'Blacklist')
    .then(function (response) {  
        res.send(response); 
    })  
}

function contentput(req, res) {
    mongo.Update({Name: req.body.Name}, req.body,  'Content')
    .then(function (response) {  
        res.send(response); 
    })  
}

function contentpost(req, res) {
    if (req.body.Name) {
        mongo.Insert(req.body, 'Content')
            .then(function (contact) {
                res.send(req.body);
            })
    }
}

function contentremove(req, res) {
    mongo.Delete(req.body, 'Content')
        .then(function (contact) {
            res.send(contact);
        })
}

function fileupload(req, res) {
    if (req.files && req.files.length == 0) {
        res.end("File is not uploaded");
    } else {
        var l = new Loader();
        var errCaught = false;
        try{
            l.loadevents('upload...' + req.files[0].originalname + '...' + req.query.directory, events);
        } catch(e) {
            errCaught = true;
            res.end("File uploaded. However, a js error was encountered when attempting to load the convo event. " + e.toString());
        }
        if (!errCaught){
            res.end("File is uploaded");
        }
    }
}

function fileExistsOnUpload(req, res) {
    var fileName = req.query.name;

    let pathStr = [];
    let fileNames = [];
    let convoEventPath = '';
    
    if (req.get('host').indexOf('localhost') > -1 && platform.startsWith('win')) {
        convoEventPath = hostPath + req.query.directory;
        pathStr.push(__dirname.replace(hostAdmin, ''));
    } else {
        convoEventPath = serverPath + req.query.directory;
        pathStr.push(__dirname.replace(serverAdmin, ''));
    }
    pathStr.push(convoEventPath);
    fs.readdirSync(pathStr.join("")).forEach(file => {
        fileNames.push(file.toString());
    })

    if (fileNames.indexOf(fileName) != -1) {
        res.send('exists');
    } else {
        res.send('not exists');
    }
}

function fileExistsOnUploadPost(req, res) {
    var fileName = req.files[0].originalname;

    let pathStr = [];
        let fileNames = [];
        let convoEventPath = '';
        if (req.get('host').indexOf('localhost') > -1&& platform.startsWith('win')) {
            convoEventPath = hostPath + req.query.directory;
            pathStr.push(__dirname.replace(hostAdmin, ''));
        } else {
            convoEventPath = serverPath + req.query.directory;
            pathStr.push(__dirname.replace(serverAdmin, ''));
        }
        pathStr.push(convoEventPath);
        fs.readdirSync(pathStr.join("")).forEach(file => {
            fileNames.push(file.toString());
        })

        if (fileNames.indexOf(fileName) != -1) {
            res.send('exists');
        } else {
            res.send('not exists');
        }
}

function getDirectories(req, res) {
    let pathStr = [];
    let srcPath = '';

    if (req.get('host').indexOf('localhost') > -1 && platform.startsWith('win')) {
        srcPath = '\\convoevents\\';
        pathStr.push(__dirname.replace('\\api\\admin', ''));
    } else {
        srcPath = '/convoevents/';
        pathStr.push(__dirname.replace('/api/admin', ''));
    }

    pathStr.push(srcPath);
    let source = pathStr.join("");

    var results = [];

    var directories = fs.readdirSync(source).filter(function(file) {
       return fs.statSync(path.join(source, file)).isDirectory();
    });

    for(var i=0;i<directories.length;i++) {
        let currentDirectory = directories[i];
        fs.readdirSync(path.join(__dirname, '../../convoevents/'+ currentDirectory)).forEach(file => {
            var directoryAndFilesObj = {};
            directoryAndFilesObj.dataDirectory = {currentDirectory : currentDirectory, words: []};
            var fileReadablePath = [];
            if (req.get('host').indexOf('localhost') > -1 && platform.startsWith('win') ){
                fileReadablePath.push(__dirname.replace('\\api\\admin', '\\convoevents\\'));
                fileReadablePath.push(currentDirectory + '\\')
            } else {
                fileReadablePath.push(__dirname.replace('/api/admin', '/convoevents/'));
                fileReadablePath.push(currentDirectory + '/')
            }

            fileReadablePath.push(file);
            let fileLoad = fileReadablePath.join("");
            var readStream = fs.readFileSync(fileLoad, 'utf8');

            let d = readStream.replace(/(\r\n|\n|\r)/gm,"");;
            let wordsArr = [];
            let words = d.toString().match(new RegExp("word: \\'" + "(.*?)" + "\\'", 'gm'));
           
           
            let eventDescription =  d.toString().match(new RegExp("event.description(.*?);", 'gm'));
            if (eventDescription) {
                var description = eventDescription[0].replace("event.description", "");
                description = description.replace("=","").replace(";","").replace("\"","").replace("\"","").replace(" ","");
                directoryAndFilesObj.description  =   description;
            }

            if (words != null) {
                for(var i=0;i<words.length;i++) {
                    var word = words[i].replace("word:", "");
                    wordsArr.push(word.replace("'", ""));
                }
                for(var i=0;i<wordsArr.length;i++) {
                    wordsArr[i] = wordsArr[i].replace("'", "");
                }
                directoryAndFilesObj.dataDirectory.currentDirectory = currentDirectory;
                directoryAndFilesObj.dataDirectory.words = wordsArr;
                results.push(directoryAndFilesObj);
            }
        })
    }

    res.send(results);
}

function createUploadDirectory(req, res) {
    let pathStr = [];
    let srcPath = '';
    let directory = req.query.name;

    if (req.get('host').indexOf('localhost') > -1 && platform.startsWith('win')) {
        srcPath = '\\convoevents\\' + directory + '\\';
        pathStr.push(__dirname.replace('\\api\\admin', ''));
    } else {
        srcPath = '/convoevents/' + directory + '/';
        pathStr.push(__dirname.replace('/api/admin', ''));
    }

    pathStr.push(srcPath);
    let source = pathStr.join("");

    if (!fs.existsSync(source)){
        fs.mkdirSync(source);
        res.send(directory + " directory has been created");
    } else {
        res.send(directory + " directory already exists");
    }
}

function sendRegistrationEmailNonSmtp(req, res) {
    var msgBody =   '<a href="' + req.body.basePath +
                    '/register?uuid=' + req.body.uuid + 
                    '&registrationEmail=' + req.body.RegistrationEmail + 
                    '">Click this link to register for Convo.</a>';
    sendmail({
        from: 'no-reply@convo.com',
        to: req.body.RegistrationEmail,
        subject: 'Register for Convo',
        html: msgBody,
    }, function(err, reply) {
        if (err){
            res.status(500).send('bad email');
        } else{
            res.send('email submitted');
        }
    });
}

function sendRegistrationEmail(req, res) {
    var msgBody =   '<a href="' + req.body.basePath +
                    '/register?uuid=' + req.body.uuid +
                    '&registrationEmail=' + req.body.RegistrationEmail +
                    '">Click this link to register for Convo.</a>';

    var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            service: 'Gmail',
            auth: {
                user: smtpUser,
                pass: smtpPassword
            }
        });

    let mailOptions = {
        from: 'no-reply@convo.com',
        to: req.body.RegistrationEmail,
        subject: 'Register for Convo',
        html: msgBody
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).send('bad email');
        } else {
            res.send('email submitted');
        }
    });
}

/*

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String
    users: [User]
  }


  type User {
      FirstName: String
      LastName: String
      
  }
`);

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return 'Hello World beater!';
  },
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');




*/

module.exports = {
    get: get,
    post: post,
    remove: remove,
    put: put,
    blacklistget: blacklistget,
    blacklistpost: blacklistpost,
    blacklistput: blacklistput,
    blacklistremove: blacklistremove,
    contentget: contentget,
    contentput: contentput,
    contentpost: contentpost,
    contentremove: contentremove,
    fileupload: fileupload,
    fileExistsOnUpload: fileExistsOnUpload,
    fileExistsOnUploadPost: fileExistsOnUploadPost,
    getDirectories: getDirectories,
    createUploadDirectory: createUploadDirectory,
    sendRegistrationEmail: sendRegistrationEmail
}
