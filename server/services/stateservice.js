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

var mongo = require('./mongo');
var session = require('./session');

var StateMachine = require("./state-machine");


function StateService(config) {
    this.config = config;
}


function doStates(convoEvent,request) {

          var stateMachine = new StateMachine(convoEvent.states);
        
          return new Promise(function (resolve, reject) {

            session.GetCurrent(request.phone)
                .then(function (savedSession) {

                    var currentState = savedSession && savedSession.state ? savedSession.state : 0;
                    var data = savedSession ? savedSession.data : {};

                    var answer = request.question[0];
                    var length = request.question.length;
                    if (length > 1) {

                        for (var i = 1; i < length; i++) {
                            answer = answer + "." + request.question[i];
                        }

                        answer = answer.substr(0, answer.length);
                    }

                    data["" + currentState] = answer;


                    // if past initial state, then validate
                    if (currentState > 0) {
                        var error = stateMachine.validate(currentState - 1, session, request, convoEvent,data);
                        if (error) {
                            return resolve(error);
                        }
                    }

                    // compute and store nextState
                    var nextState = stateMachine.getNextState(currentState, session, request, convoEvent);

                    var answer = stateMachine.getReply(currentState, session, request, convoEvent, data);

                    session.Replace(request.phone, data["0"], request.question[0], nextState, data);

                    return resolve(answer);

                })
                .catch(function (rejection) {
                    console.log("session promise failed:", rejection);
                });
        });


}

module.exports = { doStates: doStates };
