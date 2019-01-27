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

const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../services/authentication');

module.exports = function (app) {
    router.post('/', controller.post);
    router.get('/all', auth.isAuth,  controller.get);
    router.get('/getvisitorschunk', auth.isAuth, controller.getvisitorschunk);
    router.get('/getvisitorscount', auth.isAuth, controller.getvisitorscount);
    router.get('/getconvochunk', auth.isAuth, controller.getconvochunk);
    router.get('/getconvocount', auth.isAuth, controller.getconvocount);
    router.post('/groupquestion', auth.isAuth,  controller.getgroupquestion);
    router.get('/groupphone', auth.isAuth,  controller.getgroupphone);
    router.get('/getconvoforphone', auth.isAuth, controller.getconvoforphone);
    router.post('/geteventstatus',  controller.geteventstatus);
    router.post('/disableevent',  controller.disableevent);
    router.post('/inactivecommand',  controller.inactivecommand);
    router.post('/timesheetnotification', auth.isAuth, controller.timesheetnotification);
    router.get('/duplicates', auth.isAuth, controller.getduplicates);
    router.post('/sms',  controller.sms);
    app.use('/api/convo', router);
};
