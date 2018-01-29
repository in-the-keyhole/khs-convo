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

var events = require('./events');
var mongo = require('../mongo');
var session = require('../session');
var config = require('../../config');
var moment = require('moment');
var _ = require('lodash');

var StateMachine = require("../state-machine");

var host_url = config.url;

var Thresh = 10;

function removeQuestion(result, word) {
    var i = result.question.indexOf(word);
    if (i === -1) return result;

    result.question.splice(i, 1);
    return result;
}

function duplicates(){

   var list = _.flatten(_.map(events, 'words'));
   var dupes = _.filter(_.map(list, 'word'), function (value, index, iteratee) {
      return _.includes(iteratee, value, index + 1);
   });
   
   var outputList = [];
   
   _.forEach(dupes, function(value, key) {
       
       var results = _.filter(events, function(obj) { 
           var mytest = _.includes(_.map(obj.words, 'word'),dupes[key]);
           //console.log(mytest);
           return mytest;
       });
       
       
       outputList.push({
           term: value,
           filenames: results[0].filename + ' and ' + results[1].filename

       });
    });
   

    return outputList;
}

function findAnswer(result) {
    return new Promise(function (resolve, reject) {
    
        var mainEvent;
        var mainEventWeight = 0;
        result.answer = "";
        var exit = ['exit', 'x'];
        var ui = ['u'];

        result = removeQuestion(result, 'what');
        result = removeQuestion(result, 'is');
        result = removeQuestion(result, 'and');
        result = removeQuestion(result, '?');

        // Check Blacklist
        mongo.Get({ phone: result.phone }, 'Blacklist')
            .then(function (contact) {
                if (contact.length !== 0) {
                    result.answer = "Blacklisted: Please Contact Admin!";
                    return resolve(result);
                }
            });

        var revisit = session.Get(result.phone).then(
            function (r) {

                if (result.question.length === 0) {
                    result.answer = 'Invalid input. Please try again';
                    session.Delete(result.phone);
                    return resolve(result);
                }

                var entry = result.question[0].toLowerCase();

                if (exit.includes(entry)) {
                    result.answer = "Goodbye, thank you";
                    session.Delete(result.phone);
                    return resolve(result);
                }

                if (r.length > 0 ) {
                  
                    // validate session, if out of date, delete....
                    var d =  moment(r[r.length-1].date);
                    var d2 = moment(new Date());
                    if (d2.diff(d,'minutes') > config.session_timeout ) {
                        session.Delete(result.phone);
                    } else {               
                         entry = r[r.length - 1].event;
                    }
                }

                if (entry) {

                    for (var i = 0; i < events.length; i++) {
                        for (var j = 0; j < events[i].words.length; j++) {
                            if (events[i].words[j].word.toLowerCase() === entry.toLowerCase()) {
                                mainEvent = events[i];
                                break;
                            }
                            if (mainEvent) {
                                break;
                            }
                        }
                    }

                    if (mainEvent === undefined) {
                        for (var y = 0; y < result.question.length; y++) {
                            var quest = result.question[y];
                            for (var i = 0; i < events.length; i++) {
                                var event = events[i];
                                var weight = 0;
                                for (var x = 0; x < event.words.length; x++) {
                                    var word = event.words[x];
                                    var m = quest.match(RegExp(word.word)) || [];
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
                    var html = mainEvent.html();
                    var word  =  mainEvent.words[0].word;
                    result.answer = 'Link to ' + mainEvent.description + ' UI: ' + 
                        host_url + 'api/public/html/' + result.phone + '/' + word;
                    mongo.Update({phone: result.phone, event: word},{phone: result.phone, event: word, html: html }, "ui", {upsert: true} );
                    session.Delete(result.phone);
                    return resolve(result);
                  }


                    mongo.Get({ Phone: result.phone }, 'Users')
                        .then(function (contact) {
                            if (contact != null)
                                result.me = contact[0];
                            if (mainEvent.isAuth) {
                                if (contact.length == 0) {
                                    result.answer = "No Auth: Please Contact Admin!";
                                    return resolve(result);
                                }
                            }

                            mainEvent.run(result)
                                .then(function (answer) {
                                    result.answer = answer;
                                    if ( mainEvent.states)  {
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
    } );
}

module.exports = {
    findAnswer: findAnswer,
    duplicates: duplicates
}
