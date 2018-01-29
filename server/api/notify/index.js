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
var router = express.Router();
var controller = require('./controller');
var auth = require('../../services/authentication');

module.exports = function (app) {
  router.post('/group', auth.isAuth, controller.postgroup);
  router.get('/group', auth.isAuth,  controller.getgroup);
  router.put('/group', auth.isAuth,  controller.putgroup);
  router.delete('/group', auth.isAuth,  controller.deletegroup);
  //router.post('/content', auth.isAuth,  controller.contentpost);
  router.get('/scheduledNotifications', auth.isAuth,  controller.getschedulednotifications);
  app.use('/api/notify', router);
}
