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

var log4js = require('log4js');
var logger = log4js.getDefaultLogger();
var mongo = require('../mongo');
var notifyService = require('../notifyservice')

module.exports = {
    config: { 
        timerName: 'Scheduled Notifications Timer',
        callbackDelay: 60000,
        callbackMaxRun: 0
    },

    process: function() {
        logger.info('   scheduledNotifications.process() called');

        mongo.Get({} , "ScheduledNotifications")
            .then(function(records) {
                //console.log("SCHEDULEDNOTIFICATION");
                
                var now = new Date();
                now.setSeconds(0);
                //console.log('NOW: ' + now);
                //console.log('NOW: ' + now.getTime());
                //console.log('NOW: ' + now.toUTCString());

                for (var i = 0; i < records.length; i++) {
                    var record = records[i];
                    record.scheduleDate.setSeconds(0);
                    //console.dir(record); 
                    //console.log('RECORD: ' + record.scheduleDate);
                    //console.log('RECORD: ' + record.scheduleDate.getTime());
                    //console.log('RECORD: ' + record.scheduleDate.toUTCString());

                    // Send Notification if it's time
                    if(record.scheduleDate.toUTCString() === now.toUTCString()) {
                        console.log('SEND NOTIFICATION');
                        notifyService.ChooseChannels(record.msg, record.group);

                        // Now delete from mongo
                        mongo.Delete({_id: record._id}, 'ScheduledNotifications')
                            .then(function (deleted) {
                                console.log("DELETED: " + record._id);
                            });
                    } 
                }
        });
    },

    removeExpired: function() {
        logger.info('   scheduledNotifications.removeExpired() called');

        var today = new Date();
        today.setSeconds(0);

        mongo.Delete({'scheduleDate': {'$lt': today}}, 'ScheduledNotifications');
    }
}