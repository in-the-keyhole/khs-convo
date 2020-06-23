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

var mongo = require("./mongo");
var config = require('../config');
var client = require('twilio')(
    config.twilio.accountSid,
    config.twilio.authToken);
var sendmail = require('sendmail')({silent: false})
var nodemailer = require('nodemailer');
const emailConfig = config.email;
var Slack = require('slack-node');
var slackService = require('./slack')


module.exports = {
    IsEmpty: IsEmpty,
    IsInTheFuture: IsInTheFuture,
    ChooseChannels: ChooseChannels,
    CreateScheduleDate: CreateScheduleDate
}


function CreateScheduleDate(tmpDate, tmpTime) {
    var scheduleTimeExists = typeof tmpTime !== 'undefined' && !IsEmpty(tmpTime);
    var requestScheduleDate = tmpDate;
    var requestScheduleTime = '';

    if(scheduleTimeExists) {
        requestScheduleTime = tmpTime;
    } else {
        var now = new Date();
        requestScheduleTime = now.getHours() + ':' + now.getMinutes();
    }

    var dateParts = requestScheduleDate.split('-');
    var timeParts = requestScheduleTime.split(':');

    return new Date(dateParts[0], parseInt(dateParts[1])-1, dateParts[2], timeParts[0], timeParts[1], 0);
}

function IsEmpty(obj) {
    return obj === null || Object.keys(obj).length === 0;
}

function IsInTheFuture(tmpDate) {
    var now = new Date();
    now.setSeconds(0);
    return tmpDate.getTime() > now.getTime();
}

function ChooseChannels(msg, group){
    mongo.GetCI({ GroupName: group }, {}, 'NotificationGroups')
        .then(function (groupData) {
            console.dir(groupData);

             if (groupData[0].checkSMS){
                SendSMS(msg, group);
             }
            
             if (groupData[0].checkSlack){
                 SendSlack(msg, group);
             }
            
             if (groupData[0].checkEmail){
                 console.log('TODO sendEmail');
                 SendEmail(msg, group)
             }
        });
}


function SendSMS(msg, number) {
    var isNumber = /^\d+$/;

    if (isNumber.test(number)) {
        sendMsg(msg, number);
    } else {
        mongo.GetCI({ GroupName: number }, {}, 'NotificationGroups')
            .then(function (groups) {
                if(groups.length > 0 && groups[0].Users.length > 0) {
                    //console.log('USERS: ' + groups[0].Users.length);
                    var users = groups[0].Users; 

                    groups[0].Users.forEach(user => {
                        mongo.Get({Username: user.Username} , "Users").then ( function(u) {  
                            if (u.length > 0) {
                                //console.log("Group Text: " + u[0].Phone + " / " + msg); 
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


function SendEmail( msg, group ){

    let transporter = nodemailer.createTransport({
        host: emailConfig.smtp_host,
        auth: {
            user: emailConfig.smtp_user,
            pass: emailConfig.smtp_password
        }
    });

    mongo.GetCI({ GroupName: group }, {}, 'NotificationGroups')
        .then(function (groups) {
            if(groups.length > 0 && groups[0].Users.length > 0) {
                groups[0].Users.forEach(user => {
                    console.log(user);
                        if (user.Email) {

                            let mailOptions = {
                                from: emailConfig.from,
                                to: user.Email,
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

function SendSlack( msg, group ){
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



