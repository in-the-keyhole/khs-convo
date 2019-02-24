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

const events = require('./events');
const mongo = require('../mongo');
const session = require('../session');
const config = require('../../config');
const moment = require('moment');
const _ = require('lodash');

const host_url = config.url;

const Thresh = 10;

function removeQuestion(result, word) {
    const i = result.question.indexOf(word);
    if (i === -1) return result;

    result.question.splice(i, 1);
    return result;
}

function duplicates() {

    const list = _.flatten(_.map(events, 'words'));
    const dupes = _.filter(_.map(list, 'word'), function (value, index, iteratee) {
        return _.includes(iteratee, value, index + 1);
    });

    const outputList = [];

    _.forEach(dupes, function (value, key) {

        const results = _.filter(events, function (obj) {
            return _.includes(_.map(obj.words, 'word'), dupes[key]);
        });


        outputList.push({
            term: value,
            filenames: results[0].filename + ' and ' + results[1].filename

        });
    });


    return outputList;
}

function findAnswer(result) {
    // noinspection ES6ModulesDependencies
    return new Promise(function (resolve) {

        let mainEvent;
        let mainEventWeight = 0;
        result.answer = "";
        const exit = ['exit', 'x'];
        const ui = ['u'];

        result = removeQuestion(result, 'what');
        result = removeQuestion(result, 'is');
        result = removeQuestion(result, 'and');
        result = removeQuestion(result, '?');

        // Check Blacklist
        mongo.Get({phone: result.phone}, 'Blacklist')
            .then(function (contact) {
                if (contact.length !== 0) {
                    result.answer = "Blacklisted: Please Contact Admin!";
                    return resolve(result);
                }
            });

        session.Get(result.phone).then(
            function (r) {

                let word;
                if (result.question.length === 0) {
                    result.answer = 'Invalid input. Please try again';
                    session.Delete(result.phone);
                    return resolve(result);
                }

                let entry = result.question[0].toLowerCase();

                if (exit.includes(entry)) {
                    result.answer = "Goodbye, thank you";
                    session.Delete(result.phone);
                    return resolve(result);
                }

                if (r.length > 0) {

                    // validate session, if out of date, delete....
                    const d = moment(r[r.length - 1].date);
                    const d2 = moment(new Date());
                    if (d2.diff(d, 'minutes') > config.session_timeout) {
                        session.Delete(result.phone);
                    } else {
                        entry = r[r.length - 1].event;
                    }
                }

                if (entry) {

                    let i;
                    // noinspection JSUnresolvedVariable
                    for (i = 0; i < events.length; i++) {
                        for (let j = 0; j < events[i].words.length; j++) {
                            if (events[i].words[j].word.toLowerCase() === entry.toLowerCase()) {
                                mainEvent = events[i];
                                break;
                            }
                            if (mainEvent) {
                                break;
                            }
                        }
                    }

                    if (!mainEvent) {
                        for (let y = 0; y < result.question.length; y++) {
                            const quest = result.question[y];
                            // noinspection JSUnresolvedVariable
                            for (i = 0; i < events.length; i++) {
                                const event = events[i];
                                let weight = 0;
                                for (let x = 0; x < event.words.length; x++) {
                                    word = event.words[x];
                                    const m = quest.match(RegExp(word.word)) || [];
                                    if (m.length > 0) {
                                        weight += word.value;
                                    }
                                }
                                if (weight >= Thresh && weight > mainEventWeight) {
                                    mainEvent = event;
                                    mainEventWeight = weight;
                                }
                            }
                        }
                    }

                }

                if (mainEvent) {

                    // UI requested
                    if (ui.includes(result.question[0].toLowerCase()) && mainEvent.html) {
                        const html = mainEvent.html();
                        word = mainEvent.words[0].word;
                        result.answer = `Link to ${mainEvent.description} UI: ${host_url}api/public/html/${result.phone}/${word}`;

                        saveHtml(result, html, word);
                        session.Delete(result.phone);
                        return resolve(result);
                    }


                    mongo.Get({Phone: result.phone}, 'Users')
                        .then(function (contact) {
                            if (contact)
                                result.me = contact[0];
                            if (mainEvent.isAuth) {
                                if (contact.length === 0) {
                                    result.answer = "Not authorized. Please contact an administrator.";
                                    return resolve(result);
                                }
                            }

                            mainEvent.run(result)
                                .then(function (answer) {
                                    result.answer = answer;
                                    if (mainEvent.states) {
                                        // return resolve(doStates(mainEvent,result));
                                    }
                                    return resolve(result);
                                });

                        })
                } else {
                    result.answer = "Sorry, I do not understand '" + result.rawQuestion + "'.";
                    return resolve(result);
                }

            });
    });
}

function saveHtml(result, html, word) {
    mongo.Update({phone: result.phone, event: word}, {
        phone: result.phone,
        event: word,
        html: html
    }, "ui", {upsert: true});
}


module.exports = {
    findAnswer: findAnswer,
    duplicates: duplicates,
    saveHtml: saveHtml
};
