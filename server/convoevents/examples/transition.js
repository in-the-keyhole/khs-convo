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
var request = require("request");
var session = require("../../services/session");
var mongo = require("../../services/mongo");
var StateMachine = require("../../services/state-machine");

module.exports = function (events) {

    var event = {};

    event.states = [
        {reply: "Not Displayed. Handles initial call and starts flow.", desc: '0', 
            transition: function(session, request, event){ 
                var answer =  request.rawQuestion;
                console.log(answer);
                return 1;
            } 
        },
        {reply: "Transition Timesheet Example.\n(N)ew Entry or Create from (P)revious?", desc: '1', 
            transition: function(session, request, event){ 
                var answer =  request.rawQuestion;
                console.log(answer);
                if (answer.toLowerCase() == "n") { return 2; }
                else if (answer.toLowerCase() == "p") {return 5;}
                else {return 1;}
            } 
        },
        {reply: "Enter Client.", desc: '2', 
            transition: function(session, request, event){ 
                var answer =  request.rawQuestion;
                console.log(answer);
                return 3;
            } 
        },
        {reply: "Enter Day MM/DD/YYYY.", desc: '3', 
            transition: function(session, request, event){ 
                var answer =  request.rawQuestion;
                console.log(answer);
                return 4;
            } 
        },
        {reply: "Enter Hours.", desc: '4', 
            transition: function(session, request, event){ 
                var answer =  request.rawQuestion;
                console.log(answer);
                return 9;
            } 
        },
        {reply: "Add Hours for Client on Day? (Y)es\nChange: (C)lient, (H)ours, (D)ay", desc: '5', 
            transition: function(session, request, event){ 
                var answer =  request.rawQuestion;
                console.log(answer);
                if (answer.toLowerCase() == "h") {return 6;}
                else if (answer.toLowerCase() == "c") {return 7;}
                else if (answer.toLowerCase() == "d") {return 8;}
                else if (answer.toLowerCase() == "y") {return 9;}
                else {return 5;}
            } 
        },
        {reply: "Enter Hours.", desc: '6', 
            transition: function(session, request, event){ 
                var answer =  request.rawQuestion;
                console.log(answer);
                return 5;
            } 
        },
        {reply: "Enter Client.", desc: '7', 
            transition: function(session, request, event){ 
                var answer =  request.rawQuestion;
                console.log(answer);
                return 5;
            } 
        },
        {reply: "Enter Day MM/DD/YYYY.", desc: '8', 
            transition: function(session, request, event){ 
                var answer =  request.rawQuestion;
                console.log(answer);
                return 5;
            } 
        },
        {reply: "Enter Notes.", desc: '9', 
            transition: function(session, request, event){ 
                var answer =  request.rawQuestion;
                console.log(answer);
                return 10;
            } 
        },
        {reply: finish, desc: '10'}
    ];

    event.isAuth = false;
    event.description = "Transition Example";
    event.threash = 10;

    event.words = [{
        word: 'transition',
        value: 10
    }]

    event.run = function (request) {
        // originally from stateservice.js - doStates() function.  Needed to customize.
        var stateMachine = new StateMachine(event.states);
        
        return new Promise(function (resolve, reject) {

        session.GetCurrent(request.phone)
            .then(function (savedSession) {

                var currentState = savedSession && savedSession.state ? savedSession.state : 0;
                var data = savedSession ? savedSession.data : {};

                var answer = request.rawQuestion; // using rawQuestion to get data as entered
                
                data["" + currentState] = answer;

                // if past initial state, then validate
                if (currentState > 0) {
                    var error = stateMachine.validate(currentState - 1, session, request, event, data);
                    if (error) {
                        return resolve(error);
                    }
                }

                // compute and store nextState
                var nextState = stateMachine.getNextState(currentState, session, request, event);

                var answer = stateMachine.getReply(nextState, session, request, event, data);

                session.Replace(request.phone, data["0"], request.rawQuestion, nextState, data);

                return resolve(answer);

            })
            .catch(function (rejection) {
                console.log("session promise failed:", rejection);
            });
        });

    };

    events.push(event);
}

var finish = function (session, request, event) {
    session.Delete(request.phone);
    
    return 'Transition Example Ended.\nSee Timesheet.js for real implementation.';
}
