'use strict';

var config = require('../../config');

var mongo = require("../../services/mongo");
var config = require('../../config');

var client = require('twilio')(
    config.twilio.accountSid,
    config.twilio.authToken);

var Slack = require('slack-node');
var slackService = require('../../services/slack')

var _ = require('lodash');

var sendmail = require('sendmail')({silent: false})
var nodemailer = require('nodemailer');
const emailConfig = config.email;

var nodeSchedule = require('node-schedule');

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
                var scheduleDateExists = typeof request.schedule.date !== 'undefined' && !isEmpty(request.schedule.date);
                var scheduleTimeExists = typeof request.schedule.time !== 'undefined' && !isEmpty(request.schedule.time);

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
                    var isInTheFuture = scheduleDate > Date.now();

                    if(isInTheFuture) {
                        var j = nodeSchedule.scheduleJob(scheduleDate, function(){
                            chooseChannels(msg, group);
                        });
                    } else {
                        chooseChannels(msg, group);
                    }
                } else {
                    chooseChannels(msg, group);
                }
            } else {
                chooseChannels(msg, group);
            }

            return resolve('notify sent');
        })
    };

    events.push(event);
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function chooseChannels(msg, group){
    mongo.GetCI({ GroupName: group }, 'NotificationGroups')
        .then(function (groupData) {
            console.dir(groupData);

             if (groupData[0].checkSMS){
                 sendSMS(msg, group);
             }
            
             if (groupData[0].checkSlack){
                 sendSlack(msg, group);
             }
            
             if (groupData[0].checkEmail){
                 console.log('TODO sendEmail');
                 sendEmail(msg, group)
             }
        });
}


var sendEmail = function( msg, group ){

    let transporter = nodemailer.createTransport({
        host: emailConfig.smtp_host,
        service: emailConfig.smtp_service,
        auth: {
            user: emailConfig.smtp_user,
            pass: emailConfig.smtp_password
        }
    });

    mongo.GetCI({ GroupName: group }, 'NotificationGroups')
        .then(function (groups) {
            if(groups.length > 0 && groups[0].Users.length > 0) {
                groups[0].Users.forEach(user => {
                    console.log(user);
                        if (user.Username) {

                            let mailOptions = {
                                from: emailConfig.from,
                                to: user.Username,
                                subject: emailConfig.notify_subject,
                                html: msg
                            };

                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    
                                    console.log(error);
                                    //res.status(500).send('bad email');
                                } else {
                                    console.log('mail sent');
                                    //res.send('email submitted');
                                }
                            });
                        }      
                });
            }
        });
}

var sendSlack = function( msg, group ){
    slackService.getSlackInfo(true).then(function (result) {
        var slackInfo = result;
        slackInfo.slackMessage = msg;
        var khslack = new Slack();
        khslack.setWebhook(slackInfo.webhookUri);
        khslack.webhook({
            channel: slackInfo.slackChannel,
            username: slackInfo.slackUserName,
            text: slackInfo.slackMessage
        }, function (err, response) {
            if (err) {
                return reject(error)
            } else {
                if (response.response.indexOf('Bad token')!=-1){
                    return resolve("Bad Webhook Url");
                }else if (response.response.indexOf('channel_not_found')!=-1){
                    return resolve("Channel not found");
                }
            }
        })
    })
}

var sendSMS = function (msg, number) {
    var isNumber = /^\d+$/;

    if (isNumber.test(number)) {
        sendMsg(msg, number);
    } else {
        mongo.GetCI({ GroupName: number }, 'NotificationGroups')
            .then(function (groups) {
                if(groups.length > 0 && groups[0].Users.length > 0) {
                    console.log('USERS: ' + groups[0].Users.length);
                    var users = groups[0].Users; 

                    groups[0].Users.forEach(user => {
                        mongo.Get({Username: user.Username} , "Users").then ( function(u) {  
                            if (u.length > 0) {
                                console.log("Group Text: " + u[0].Phone + " / " + msg); 
                                sendMsg(msg, u[0].Phone);
                            }     
                        })   
                    });
                    }
            });
    }
}


var sendMsg = function (msg, number) {
    client.messages.create({
        from: '+'+config.twilio.phone,
        to: '+1' + number,
        body: msg
    }).then(function (msg) { console.log(msg); });
}