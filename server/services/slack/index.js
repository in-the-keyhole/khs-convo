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

const config = require('../../config');
const mongo = require('../mongo');


/**
 * Return result content, if present, else return given defaultValue.
 *
 * @param result
 * @param defaultValue
 * @returns {*}
 */
function resolveSlackResult(result, defaultValue) {
    return (result && result.length && result[0].Content)
        ? result[0].Content
        : defaultValue;
}


/**
 * @returns promise of web hook URI
 */
const getWebhookUrl = () => {

    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve, reject) {
        mongo.Get({Name: "slackwebhookuri"}, 'Content')
            .then(function (result) {

                // const slackwebhookuri =
                //     (result && result.length && result[0].Content)
                //         ? result[0].Content
                //         : config.slack.webhookUri;

                resolve(resolveSlackResult(result, config.slack.webhookUri));
            })
            .catch(() => {
                reject(`Error`);
            });
    })
};


/**
 * Return promised result content, if present, else return resovled given failure or successMessage.
 *
 * @param slackType
 */
const getSlackMessage = slackType => {
    if (slackType) {

        // noinspection ES6ModulesDependencies
        return new Promise(function (resolve, reject) {
            mongo.Get({Name: "slacksuccessmessage"}, 'Content').then(function (result) {

                // const slackmessage =
                //     (result && result.length && result[0].Content)
                //         ? result[0].Content
                //         : config.slack.successMessage;

                resolve(resolveSlackResult(result, config.slack.successMessage));

            }).catch(function (error) {
                reject(error);
            })
        });

    } else {
        // noinspection ES6ModulesDependencies
        return new Promise(function (resolve, reject) {
            mongo.Get({Name: "slackfailuremessage"}, 'Content').then(function (result) {

                // const slackmessage =
                //     (result && result.length && result[0].Content)
                //         ? result[0].Content
                //         : config.slack.failureMessage;

                resolve(resolveSlackResult(result, config.slack.failureMessage));

            }).catch(function (error) {
                reject(error);
            })
        });
    }
};


/**
 * Return promise of result content, if present, else return promise of given failure or successMessage.
 */
const getSlackChannel = () => {

    // noinspection ES6ModulesDependencies
    return new Promise(resolve => {
        mongo.Get({Name: "slackchannel"}, 'Content')
            .then(function (result) {

                // const slackChannel =
                //     (result && result.length && result[0].Content)
                //         ? result[0].Content
                //         : config.slack.channel;

                resolve(resolveSlackResult(result, config.slack.channel));

            })
            .catch(function (error) {
                console.log(error)
            })
    });
};


/**
 * Return promise of user name, if present, else return promise of given failure or successMessage.
 */
const getSlackUserName = () => {
    // noinspection ES6ModulesDependencies
    return new Promise(resolve => {
        mongo.Get({Name: "slackusername"}, 'Content')
            .then(function (result) {

                // const slackusername =
                //     (result && result.length && result[0].Content)
                //         ? result[0].Content
                //         : config.slack.channel;

                resolve(resolveSlackResult(result, config.slack.channel));

            })
            .catch(error => {
                console.log(error)
            })
    });
};


/**
 * PUBLIC API
 * Returns aggregate promise of web hook URL, slack message-per-slack-type, slack channel, and slack user name
 * @param slackType
 */
const getSlackInfo = slackType => {
    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve, reject) {

        // noinspection ES6ModulesDependencies
        Promise.all([getWebhookUrl(), getSlackMessage(slackType), getSlackChannel(), getSlackUserName()]).then((result) => {

            let i = 0;
            resolve({
                webhookUri: result[i++],
                slackMessage: result[i++],
                slackChannel: result[i++],
                slackUserName: result[i]
            });
        })
            .catch(function (error) {
                reject(error);
            });
    })
};

module.exports = {
    getSlackInfo: getSlackInfo
};
