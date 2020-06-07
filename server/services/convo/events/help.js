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

var events = require('../events');
var mongo = require("../../mongo");
var config = require('../../../config');
var pug = require('pug');

var host_url = config.url;


module.exports = function (events) {
    var event = {};
    event.isAuth = false;
    event.description = "Command Help";
    event.words = [{
        word: 'commands',
        value: 10
    },
    {
        word: 'command',
        value: 10
    }]
    event.threash = 10;
    event.run = function (result) {

        return new Promise(function (resolve, reject) {

            mongo.Get({ Name: "commandsintro" }, 'Content')
                .then(function (comIntro) {
                    console.log(comIntro);
                    mongo.Get({ Name: "commandsend" }, 'Content')
                        .then(function (comEnd) {
                            //console.log(comEnd);

                            //console.log(comIntro[0].Content + "  " + comEnd[0].Content);
                            var help = '';
                            if (comIntro != null && comIntro[0] != null) {
                                help = comIntro[0].Content + "\n";
                            } else {
                                help = "Keyhole SMS commands\n";
                            }

                            for (var i = 0; i < events.length; i++) {
                                let event = events[i];
                                console.log(event);
                                help = help + event.description + " (";
                                for (var j = 0; j < event.words.length; j++) {
                                    if (event.words.length > 1) {
                                        if (j == 0) {
                                            help = help + event.words[j].word;
                                        } else {
                                            help = help + " | " + event.words[j].word;
                                        }
                                    } else if (event.words.length === 1) {
                                        help = help + event.words[j].word;
                                        continue;
                                    } else {
                                        break;
                                    }
                                }
                                help = help + ")\n";
                            }

                            if (comEnd != null && comEnd[0] != null) {
                                help = help + comEnd[0].Content;
                            } else {
                                help = help + "Here's a link for more info https://public.grokola.com/#grok/6a3fdc54-d830-4720-a275-9b5f19f1ea70";
                            }

                            mongo.Update({ phone: result.phone, event: 'commands' }, { phone: result.phone, event: 'commands', html: compileHtml(events) }, "ui", { upsert: true });

                            help += ' Link to UI: ' + host_url + 'api/public/html/' + result.phone + '/commands';


                            console.log(help);

                            return resolve(help);
                        });
                });
        })
    }

    var compileHtml = function (events) {
        var compiledFunction = pug.compileFile('templates/help.pug');
        console.log(events);
        return compiledFunction({ url: host_url, convos: events });
    }

    events.push(event);

}
