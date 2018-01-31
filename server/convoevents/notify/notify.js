'use strict';

var config = require('../../config');
var mongo = require("../../services/mongo");
var notifyService = require('../../services/notifyservice');
var uuid = require('uuid');
var moment = require('moment');

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

            var group = request.question[1];  // number or group

            var msg = "";
            if (request.question.length > 2) {
                msg = request.question.slice(2).join(' ');
            }
        
            var scheduleDateExists = typeof request.scheduleDate !== 'undefined' && !notifyService.IsEmpty(request.scheduleDate);

            if(scheduleDateExists) {
                var momentScheduleDate = moment(request.scheduleDate).toDate();

                if(notifyService.IsInTheFuture(momentScheduleDate)) {
                    mongo.Insert({ 
                        "uuid": uuid(),
                        "scheduleDate": momentScheduleDate,
                        "msg": msg,
                        "group": group
                        }, 'ScheduledNotifications');
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

