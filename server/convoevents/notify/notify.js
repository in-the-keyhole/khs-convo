'use strict';

var config = require('../../config');
var mongo = require("../../services/mongo");
var notifyService = require('../../services/notifyservice')

module.exports = function (events) {

    var event = {};
    event.isAuth = false;
    event.description = "Notify group custom text";
    event.words = [{
        word: 'notify',
        value: 10
    }]

    
    event.run = function (request) {
        return new Promise(function (resolve, reject) {
            //console.log('NOTIFY');
            //console.dir(request);

            var group = request.question[1];  // number or group

            var msg = "";
            if (request.question.length > 2) {
                msg = request.question.slice(2).join(' ');
            }
        
            var scheduleExists = typeof request.schedule !== 'undefined';
            if(scheduleExists) {
                var scheduleDateExists = typeof request.schedule.date !== 'undefined' && !notifyService.IsEmpty(request.schedule.date);
                var scheduleTimeExists = typeof request.schedule.time !== 'undefined' && !notifyService.IsEmpty(request.schedule.time);

                if(scheduleDateExists) {
                    var requestScheduleDate = request.schedule.date;
                    var requestScheduleTime = '';

                    if(scheduleTimeExists) {
                        requestScheduleTime = request.schedule.time;
                    } else {
                        var now = new Date();
                        requestScheduleTime = now.getHours() + ':' + now.getMinutes();
                    }

                    var dateParts = requestScheduleDate.split('-');
                    var timeParts = requestScheduleTime.split(':');

                    var scheduleDate = new Date(dateParts[0], parseInt(dateParts[1])-1, dateParts[2], timeParts[0], timeParts[1], 0);
                    //console.log("SCHEDULEDATE.GETTIME: " + scheduleDate.getTime());

                    if(notifyService.IsInTheFuture(scheduleDate)) {
                        mongo.Insert({ 
                            "scheduleDate": scheduleDate,
                            "msg": msg,
                            "group": group
                            }, 'ScheduledNotifications');
                    } else {
                        notifyService.ChooseChannels(msg, group);
                    }
                } else {
                    notifyService.ChooseChannels(msg, group);
                }
            } else {
                notifyService.ChooseChannels(msg, group);
            }

            return resolve('notify sent');
        })
    };

    events.push(event);
}

