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

var multer = require('multer');
const util = require('util');

var fs = require('fs');
var fileNameCheck = multer();

let platform = process.platform;
let hostPath = '\\convoevents\\';
let hostAdmin = '\\api\\admin';

let serverPath = '/convoevents/';
let serverAdmin = '/api/admin';

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let pathStr = [];
        let convoEventPath = '';
        if (req.get('host').indexOf('localhost') > -1 && platform.startsWith('win')) {
            convoEventPath = hostPath + req.query.directory;
            pathStr.push(__dirname.replace(hostAdmin, ''));
        } else {
            convoEventPath = serverPath + req.query.directory;
            pathStr.push(__dirname.replace(serverAdmin, ''));
        }

        pathStr.push(convoEventPath);
        cb(null, pathStr.join(""))
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname )
  }
})

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.originalname.slice(-3) !== '.js') {
            return cb(new Error('Only js files are allowed'))
        }

        cb(null, true)
    }
})

var express = require('express');
var router = express.Router();
var controller = require('./controller');
var auth = require('../../services/authentication');

module.exports = function (app) {
  router.get('/content', auth.isAuth, controller.contentget);
  router.put('/content', auth.isAuth,  controller.contentput);
  router.post('/content', auth.isAuth,  controller.contentpost);
  router.delete('/content', auth.isAuth,  controller.contentremove);
  router.get('/blacklist', auth.isAuth, controller.blacklistget);
  router.post('/blacklist', auth.isAuth,  controller.blacklistpost);
  router.put('/blacklist', auth.isAuth,  controller.blacklistput);
  router.delete('/blacklist', auth.isAuth,  controller.blacklistremove);
  router.get('/', auth.isAuth, controller.get);
  router.post('/', auth.isAuthAdmin,  controller.post);
  router.put('/', auth.isAuthAdmin,  controller.put);
  router.delete('/', auth.isAuthAdmin,  controller.remove);
  router.post('/sendRegistrationEmail', auth.isAuthAdmin,  controller.sendRegistrationEmail);
  router.get('/getDirectories', auth.isAuth, controller.getDirectories);
  router.post('/fileupload', upload.any(), controller.fileupload);
  router.get('/fileExistsOnUpload', auth.isAuth, controller.fileExistsOnUpload);
  router.post('/fileExistsOnUploadPost', fileNameCheck.any(), controller.fileExistsOnUploadPost);
  app.use('/api/admin', router);
}
