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

var Slack = require('slack-node');
var slackService = require('../../services/slack')

module.exports = function (events) {

    var event = {};
    event.isAuth = false;
    event.description = "Notify Slack Channel with Message";
    event.words = [{ word: 'slack', value: 10 }];

    event.run = function (request) {

        return new Promise(function (resolve, reject) {

            var msg = "";

            for (var i = 1; i < request.question ; i++) {

                msg +=  request.question[i] + " ";
            }
            console.log(msg);    

            slackService.getSlackInfo(true).then(function (result) {
                var slackInfo = result;
                var khslack = new Slack();
                khslack.setWebhook(slackInfo.webhookUri);
                khslack.webhook({
                    channel: slackInfo.slackChannel,
                    username: slackInfo.slackUserName,
                    text: msg
                }, function (err, response) {
                    if (err) {
                        return reject(error)
                    } else {
                        if (response.response.indexOf('Bad token')!=-1){
                            return resolve("Bad Webhook Url");
                        }else if (response.response.indexOf('channel_not_found')!=-1){
                            return resolve("Channel not found");
                        }else {
                            return resolve("Message sent to Slack Channel "+slackInfo.slackChannel);
                        }
                    }
                })
            })
                .catch(function (error) {
                    return reject(error)
                });;
        })
    }
    events.push(event);
}
