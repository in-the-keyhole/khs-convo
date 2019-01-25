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

const mongo = require("../../mongo");
const config = require('../../../config');
const pug = require('pug');

const host_url = config.url;


module.exports = function (events) {
    const event = {};
    event.isAuth = false;
    event.description = "Command Help";
    event.words = [{
        word: 'commands',
        value: 10
    },
        {
            word: 'command',
            value: 10
        }];
    event.threash = 10;
    event.run = function (result) {

        return new Promise((resolve) => {

            mongo.Get({Name: "commandsintro"}, 'Content')
                .then((comIntro) => {
                    console.log(comIntro);

                    mongo.Get({Name: "commandsend"}, 'Content')
                        .then((comEnd) => {

                            let help = '';
                            if (comIntro && comIntro.length) {
                                help = comIntro[0].Content + "\n";
                            } else {
                                help = 'Keyhole SMS commands\n';
                            }

                            for (let i = 0; i < events.length; i++) {
                                let event = events[i];
                                console.log(event);

                                help = help + event.description + " (";
                                for (let j = 0; j < event.words.length; j++) {
                                    if (event.words.length > 1) {
                                        if (j === 0) {
                                            help += event.words[j].word;
                                        } else {
                                            help += (" | " + event.words[j].word);
                                        }
                                    } else if (event.words.length === 1) {
                                        help = help + event.words[j].word;
                                    } else {
                                        break;
                                    }
                                }
                                help += ')\n';
                            }

                            if (comEnd && comEnd.length) {
                                help += comEnd[0].Content;
                            } else {
                                help += 'https://public.grokola.com/#grok/6a3fdc54-d830-4720-a275-9b5f19f1ea70';
                            }
// TODO Stop injecting HTML from the API
                            mongo.Update({phone: result.phone, event: 'commands'}, {
                                phone: result.phone,
                                event: 'commands',
                                html: compileHtml(events)
                            }, "ui", {upsert: true});

                            help += ` Information: ${host_url}api/public/html/${result.phone || '9132700360'}/commands`;


                            console.log(help);

                            return resolve(help);
                        });
                });
        })
    };

    var compileHtml = function (events) {
        var compiledFunction = pug.compileFile('templates/help.pug');
        console.log(events);
        return compiledFunction({url: host_url, convos: events});
    };

    events.push(event);

};
