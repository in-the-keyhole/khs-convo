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
var config = require('../../config');
var _ = require('lodash');
var fs = require('fs');
var uuid = require('uuid');
var moment = require('moment');

function postgroup(req, res) {
    req.body.uuid = uuid();
    mongo.Insert(req.body, 'NotificationGroups')
        .then(function (group) {
            res.send(req.body);
        });
}

function getgroup(req, res) {
    mongo.Get({}, 'NotificationGroups')
        .then(function (groups) {
            res.send(groups); 
        });
}

function putgroup(req, res) {
    var data = _.omit(req.body, ['_id']);

    mongo.Update({uuid: req.body.uuid}, {$set: data},  'NotificationGroups')
        .then(function (response) {  
            res.send(response); 
        });
}

function deletegroup(req, res) {
    mongo.Delete({uuid: req.body.uuid}, 'NotificationGroups')
        .then(function (response) {

            res.send(response);
        });
}

function getgroupusers(req, res) {
    mongo.GetSort({}, {LastName: 1, FirstName: 1}, 'Users')
        .then(function (users) {
            
            var visible = _.filter(users, function(user) {
                return user.Status !== 'removed';
            });
            
            res.send(visible); 
        });
}

function put(req, res) {
    var data = _.omit(req.body, ['_id']);

    mongo.Update({uuid: req.body.uuid}, {$set: data},  'NotificationGroups')
    .then(function (response) {  
        res.send(response); 
    })  
}

function getschedulednotification(req, res) {
    var today = new Date();
    today.setSeconds(0);

    mongo.GetCI(
        {'group': req.query.group, 'scheduleDate': {'$gte': today} }, 
        {scheduleDate: 1}, 
        'ScheduledNotifications')
    .then(function (sns) {
        res.send(sns); 
    });
}
function deleteschedulednotification(req, res) {
    mongo.Delete({'uuid': req.body.uuid}, 'ScheduledNotifications')
       .then(function (response) {
           res.send(response);
       });  
}
function putschedulednotification(req, res) {
    var data = _.omit(req.body, ['_id']);
    data.scheduleDate = moment(data.scheduleDate).toDate();

    mongo.Update({uuid: req.body.uuid}, {$set: data},  'ScheduledNotifications')
    .then(function (response) {  
        res.send(response); 
    });
}



module.exports = {
    postgroup: postgroup, 
    getgroup: getgroup,
    putgroup: putgroup,
    deletegroup: deletegroup,
    
    getschedulednotification: getschedulednotification,
    deleteschedulednotification: deleteschedulednotification,
    putschedulednotification: putschedulednotification
}
