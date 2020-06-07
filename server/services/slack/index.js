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

var config = require('../../config');
var mongo = require('../mongo')

let getWebhookUrl = function () {
    var slackwebhookuri;

    return new Promise(function (resolve, reject) {
        mongo.Get({ Name: "slackwebhookuri" }, 'Content')
            .then(function (result) {
                var  slackwebhookuri;
                if (result != null  && result.length>0 && result[0].Content != null) {
                    slackwebhookuri = result[0].Content;
                }else {
                    slackwebhookuri = config.slack.webhookUri;
                }
                resolve(slackwebhookuri);
            })
            .catch(function (error) {
                reject('error');
            });
    })
}

let getSlackMessage = function (slackType) {
    if (slackType) {

        return new Promise(function (resolve, reject) {
            mongo.Get({ Name: "slacksuccessmessage" }, 'Content').then(function (result) {
                var  slackmessage;
                if (result != null && result.length>0 && result[0].Content != null) {
                    slackmessage = result[0].Content;
                }else {
                    slackmessage = config.slack.successMessage;
                }
                resolve(slackmessage);
            }).catch(function (error) {
                reject(error);
            })
        });

    } else {
        return new Promise(function (resolve, reject) {
            mongo.Get({ Name: "slackfailuremessage" }, 'Content').then(function (result) {
                var  slackmessage;
                if (result != null && result.length>0  && result[0].Content != null) {
                    slackmessage = result[0].Content;
                }else {
                    slackmessage = config.slack.failureMessage;
                }
                resolve(slackmessage);
            }).catch(function (error) {
                reject(error);
            })
        });
    }
}

let getSlackChannel = function () {

    return new Promise(function (resolve, reject) {
        mongo.Get({ Name: "slackchannel" }, 'Content')
            .then(function (result) {
                var slackChannel;
                if (result!=null && result.length>0 &&  result[0].Content !=null){
                    slackChannel = result[0].Content;
                }else {
                    slackChannel =  config.slack.channel;
                }
                resolve(slackChannel);
            })
            .catch(function (error) {
                console.log(error)
            })
    });
}

let getSlackUserName = function () {
    return new Promise(function (resolve, reject) {
        mongo.Get({ Name: "slackusername" }, 'Content')
            .then(function (result) {
                var slackusername;
                if (result!=null && result.length>0  && result[0].Content !=null){
                    slackusername = result[0].Content;
                }else {
                    slackusername =  config.slack.channel;
                }
                resolve(slackusername);
            })
            .catch(function (error) {
                console.log(error)
            })
    });
}


let getSlackInfo = function (slackType) {
    return new Promise(function (resolve, reject) {
        
        Promise.all([getWebhookUrl(), getSlackMessage(slackType), getSlackChannel(), getSlackUserName()]).then(function (results) {

            var slack = {
                webhookUri: results[0],
                slackMessage: results[1],
                slackChannel: results[2],
                slackUserName: results[3]
            }
            resolve(slack);
        })
            .catch(function (error) {
                reject(error);
            });
    })
}

module.exports = {
    getSlackInfo: getSlackInfo
}
