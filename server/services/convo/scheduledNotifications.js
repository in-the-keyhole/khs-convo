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

const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = 'debug';
const mongo = require('../mongo');
const notifyService = require('../notifyservice');

module.exports = {
    config: {
        timerName: 'Scheduled Notifications Timer',
        callbackDelay: 60000,
        callbackMaxRun: 0
    },

    process: function () {
        logger.info('   scheduledNotifications.process() called');

        mongo.Get({}, "ScheduledNotifications")
            .then(function (records) {

                const now = new Date();
                now.setSeconds(0);

                for (let i = 0; i < records.length; i++) {
                    const record = records[i];
                    record.scheduleDate.setSeconds(0);

                    // Send Notification if it's time
                    if (record.scheduleDate.toUTCString() === now.toUTCString()) {
                        console.log('SEND NOTIFICATION');

                        notifyService.ChooseChannels(record.msg, record.group);

                        // Now delete from mongo
                        mongo.Delete({_id: record._id}, 'ScheduledNotifications')
                            .then(() => {
                                console.log(`DELETED: ${record._id}`);
                            });
                    }
                }
            });
    },

    removeExpired: function () {
        logger.info('   scheduledNotifications.removeExpired() called');

        const today = new Date();
        today.setSeconds(0);

        mongo.Delete({'scheduleDate': {'$lt': today}}, 'ScheduledNotifications');
    }
};
