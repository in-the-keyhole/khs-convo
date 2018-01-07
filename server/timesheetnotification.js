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

var http = require('http');
var config = require('./config');
var request = require('request');
var log4js = require('log4js');
var logger = log4js.getDefaultLogger();

const util = require('util');

module.exports = {
    process: function() {
        logger.info('timesheetnotification.process() called');

        let timesheetDayNotification = '';
        let timesheetMinuteNotification = '0';
        let timesheetTextNotification = '';

        request({
            url: config.url + 'api/admin/content',
            method: 'GET',
            headers: {
                'token': config.sample_token,
                'Content-Type': 'application/json'
            }
        }, function(error, response, body){
            var content = JSON.parse(body);

            for(var i=0;i<content.length;i++) {
                switch(content[i].Name) {
                    case 'Timesheet Day Notification':
                        timesheetDayNotification = content[i].Content;
                        break;
                    case 'Timesheet Minute Notification':
                        timesheetMinuteNotification = content[i].Content;
                        break;
                    case 'Timesheet Text Notification':
                        timesheetTextNotification = content[i].Content;
                        break;
                }
            }
            logger.info('timesheetDayNotification: ' + timesheetDayNotification + ', timesheetMinuteNotification: ' + timesheetMinuteNotification);

            var currentDate = new Date();
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            var hoursToRun = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
            var currentDay = days[currentDate.getDay()]
            var currentHour = currentDate.getHours();
            var currentMinute = currentDate.getMinutes().toString();
            logger.info('currentDay: ' + currentDay + ' | currentHour: ' + currentHour  + ' | currentMinute: ' + currentMinute);

            // Determine if conditions to send are valid
            var validDayToSend = timesheetDayNotification === currentDay;
            var validHourToSend = hoursToRun.indexOf(currentHour) >= 0;
            var validMinuteToSend = timesheetMinuteNotification === currentMinute;
            logger.info('validDayToSend: ' + validDayToSend + ' | validHourToSend: ' + validHourToSend  + ' | validMinuteToSend: ' + validMinuteToSend);
            
            // If all conditions are valid, then send text notifications
            if (validDayToSend && validHourToSend && validMinuteToSend) {
                module.exports.sendNotifications(timesheetTextNotification);
            }
        });
    },
 
    sendNotifications: function(timesheetTextNotification) {
        logger.info('timesheetnotification.sendNotifications() called');

        request({
            url: config.url + 'api/admin',
            method: 'GET',
            headers: {
                'token': config.sample_token,
                'Content-Type': 'application/json'
            }
        }, function(error, response, body){
            var users = JSON.parse(body);
            var propObject = { text: timesheetTextNotification };

            request({
                url: config.url + 'api/convo/timesheetnotification',
                qs: propObject,
                method: "POST",
                json: true,
                headers: {
                    'token': config.sample_token,
                    'Content-Type': 'application/json'
                },
                body: users
            }, function (error, response, body){
                console.log(body);
            });
        });
    }
}
