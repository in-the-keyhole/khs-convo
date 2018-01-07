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

var config = require('../../config');

var mongo = require("../../services/mongo");
var config = require('../../config');

var client = require('twilio')(
    config.twilio.accountSid,
    config.twilio.authToken);

module.exports = function (events) {

    var event = {};
    event.isAuth = false;
    event.description = "Nofity Jenkins Build Failure";
    event.words = [{
        word: 'failure',
        value: 10
    }]
    event.run = function (request) {

        var number = request.question[1];  // number or group

        var msg = "Failure Occured, Unkown Origin";
        if (request.question.length > 2) {
            msg = request.question[2];
        }
        console.log("Text Failure to :" + number);




        return new Promise(function (resolve, reject) {

            return resolve(

                send("Failure: " + msg, number));

        })
    };

    events.push(event);

}

var send = function (msg, number) {

    var isNumber = /^\d+$/;

    if (isNumber.test(number)) {
        sendMsg(msg, number);
    } else {

        mongo.Get({ GroupName: number }, 'NotificationGroups')
            .then(function (list) {

                for (var i = 0; i < list.length; i++) {

                   var users = list[i].Users; 
                   for (var j = 0 ; j < users.length ; j++) {
                    if (users[j].Username) {
                        // lookup user 
                        mongo.Get({Username: users[j].Username} , "Users").then ( function(u) {  
                           console.log("Group Text:" + u[0].Phone); 
                           if (u.length > 0) {
                             sendMsg(msg, u[0].Phone);
                           }     
                        })
                   
                      }  
                   }     
                   
                }

            });

    }



}


var sendMsg = function (msg, number) {


    client.messages.create({

        from: '+19132703506',
        to: '+1' + number,
        body: 'Open Shift Build/Deploy Failure'

    }).then(function (msg) { console.log(msg); });



}
