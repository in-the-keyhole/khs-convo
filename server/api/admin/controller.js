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

const mongo = require('../../services/mongo');
const ObjectId = require('mongodb').ObjectID;
const nodemailer = require('nodemailer');
const config = require('../../config');
const uuid = require('uuid');
const _ = require('lodash');
const Loader = require('../../services/eventloader');
const fs = require('fs');

const path = require('path');
const events = require('../../services/convo/events');
const emailConfig = config.email;

let platform = process.platform;
let hostPath = '\\convoevents\\';
let hostAdmin = '\\api\\admin';

let serverPath = '/convoevents/';
let serverAdmin = '/api/admin';

function get(req, res) {

    mongo.GetSort({}, {LastName: 1, FirstName: 1}, 'Users')
        .then(function (users) {

            const visible = _.filter(users, function (user) {
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
    if (req.body.Email !== req.body.ConfirmEmail) {
        return res.send("The email address pair does not match");
    }

    mongo.Get({Username: req.body.Email, Status: {$ne: "removed"}}, "Users")
        .then(function (response) {

            if (response.length > 0) {
                res.send("The email address is previously registered");
            } else {
                mongo.Insert(req.body, 'Users')
                    .then(function (contact) {
                    });

                req.body.RegistrationEmail = req.body.Email;
                return sendRegistrationEmail(req, res);
            }
        })
        .catch(function (error) {
            console.log(" Duplication check error  " + error);

        });
}

function blacklistpost(req, res) {

    if (req.body.phone) {
        mongo.Insert(req.body, 'Blacklist')
            .then(function () {
                res.send(req.body);
            })
    }
}

function remove(req, res) {
    if (req.body.uuid) {
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
    console.log(`blacklistremove`, req);
    mongo.Delete(req.body, 'Blacklist')
        .then(function (contact) {
            res.send(contact);
        })
}

function put(req, res) {

    const data = _.omit(req.body, ['_id']);

    mongo.Update({uuid: req.body.uuid}, {$set: data}, 'Users')
        .then(function (response) {
            res.send(response);
        })
}

/**
 * Given, a Blackist record, including _id, update any or all of its fields except _id
 * eg. PUT a bookstrap table cell edit's "cellValue". Mongo will update its copy.
 * */
function blacklistput(req, res) {
    const r = req.body;
    const query = {_id: ObjectId(r._id)};
    const data = {phone: r.phone, notes: r.notes};

    mongo.Update(query, data, 'Blacklist')
        .then(function (response) {
            res.send(response);
        })
}

function contentput(req, res) {
    mongo.Update({Name: req.body.Name}, req.body, 'Content')
        .then(function (response) {
            res.send(response);
        })
}

function contentpost(req, res) {
    if (req.body.Name) {
        mongo.Insert(req.body, 'Content')
            .then(function () {
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
    if (req.files && !req.files.length) {
        res.end("File is not uploaded");
    } else {
        const l = new Loader();
        let errCaught = false;
        try {
            l.loadevents('upload...' + req.files[0].originalname + '...' + req.query.directory, events);
        } catch (e) {
            errCaught = true;
            res.end("File uploaded. However, a js error was encountered when attempting to load the convo event. " + e.toString());
        }
        if (!errCaught) {
            res.end("File is uploaded");
        }
    }
}

function fileExistsOnUpload(req, res) {
    const fileName = req.query.name;

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
    });

    if (fileNames.indexOf(fileName) !== -1) {
        res.send('exists');
    } else {
        res.send('not exists');
    }
}

function fileExistsOnUploadPost(req, res) {
    const fileName = req.files[0].originalname;

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
    });

    if (fileNames.indexOf(fileName) !== -1) {
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

    const results = [];

    const directories = fs.readdirSync(source).filter(function (file) {
        return fs.statSync(path.join(source, file)).isDirectory();
    });

    for (let i = 0; i < directories.length; i++) {
        let currentDirectory = directories[i];
        fs.readdirSync(path.join(__dirname, '../../convoevents/' + currentDirectory)).forEach(file => {
            const directoryAndFilesObj = {};
            directoryAndFilesObj.dataDirectory = {currentDirectory: currentDirectory, words: []};
            const fileReadablePath = [];
            if (req.get('host').indexOf('localhost') > -1 && platform.startsWith('win')) {
                fileReadablePath.push(__dirname.replace('\\api\\admin', '\\convoevents\\'));
                fileReadablePath.push(currentDirectory + '\\')
            } else {
                fileReadablePath.push(__dirname.replace('/api/admin', '/convoevents/'));
                fileReadablePath.push(currentDirectory + '/')
            }

            fileReadablePath.push(file);
            let fileLoad = fileReadablePath.join("");
            const readStream = fs.readFileSync(fileLoad, 'utf8');

            let d = readStream.replace(/(\r\n|\n|\r)/gm, "");
            let wordsArr = [];
            let words = d.toString().match(new RegExp("word: \\'" + "(.*?)" + "\\'", 'gm'));


            let eventDescription = d.toString().match(new RegExp("event.description(.*?);", 'gm'));
            if (eventDescription) {
                let description = eventDescription[0].replace("event.description", "");
                description = description.replace("=", "").replace(";", "")
                    .replace("\"", "").replace("\"", "")
                    .replace(" ", "");
                directoryAndFilesObj.description = description;
            }

            if (words != null) {
                let i;
                for (i = 0; i < words.length; i++) {
                    const word = words[i].replace("word:", "");
                    wordsArr.push(word.replace("'", ""));
                }
                for (i = 0; i < wordsArr.length; i++) {
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

// Unused
/*function sendRegistrationEmailNonSmtp(req, res) {
    const msgBody =   '<a href="' + req.body.basePath +
                    '/register?uuid=' + req.body.uuid +
                    '&registrationEmail=' + req.body.RegistrationEmail +
                    '">Click this link to register for Convo.</a>';
    sendmail({
        from: 'no-reply@convo.com',
        to: req.body.RegistrationEmail,
        subject: 'Register for Convo',
        html: msgBody,
    }, function(err) {
        if (err){
            res.status(500).send('bad email');
        } else{
            res.send('email submitted');
        }
    });
}*/

function sendRegistrationEmail(req, res) {
    const msgBody = '<a href="' + req.body.basePath +
        '/register?uuid=' + req.body.uuid +
        '&registrationEmail=' + req.body.RegistrationEmail +
        '">Click this link to register for Convo.</a>';

    const transporter = nodemailer.createTransport({
        host: emailConfig.smtp_host,
        service: emailConfig.smtp_service,
        auth: {
            user: emailConfig.smtp_user,
            pass: emailConfig.smtp_password
        }
    });

    let mailOptions = {
        from: emailConfig.from,
        to: req.body.RegistrationEmail,
        subject: emailConfig.register_subject,
        html: msgBody
    };

    transporter.sendMail(mailOptions, (error) => {
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
    sendRegistrationEmail: sendRegistrationEmail
};
