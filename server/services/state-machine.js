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

var session = require('./session');
var Validators = require('./validation');

// Example Configuration
// [
//     {reply: "Question 1?", validator: 'number', desc: 'Question 1 Description'},
//     {reply: "Question 2?", validator:  function(session, request, event) { }, desc: 'Question 2 Description'},
//     {reply: "Question 3?", transition: function(session, request, event) { return aStateIndex }, desc: 'Question 3 Description'},
//     {reply: function(session, request, event) { return "some reply"; } }
// ];

function StateMachine(config) {
    this.config = config;
}

StateMachine.prototype.validate = function (stateIndex, session, request, event, data) {
    var validator;
    if (this.config[stateIndex].choices) {
       var choices = this.config[stateIndex].choices;
       for (var i = 0; i < choices.length; i++) {
            if (choices[i].choice.toLowerCase() === data[""+stateIndex].toLowerCase()) {
                validator = choices[i].validator;
            }
       }

    } else {
       validator = this.config[stateIndex].validator;
    }
    if (!validator) return;
    return typeof(validator) == 'function'
        ? validator(session, request, event, data)
        : Validators[strip(validator)](session, request, event, validator);
};

StateMachine.prototype.getCurrentState = function (currentIndex, session, request, event) {
   return transitionCurrent(this.config,currentIndex,session, request, event);
};

StateMachine.prototype.getNextState = function (currentIndex, session, request, event) {
   //return this.config[currentIndex].transition ? this.config[currentIndex].transition(session, request, event) : ++currentIndex;
    if (this.config[currentIndex].transition) {
        var returnValue = 0;
        var transitionTo =  this.config[currentIndex].transition(session, request, event);

        for (var i = 0; i < this.config.length; i++ ) {
            if (this.config[i].state) {
                if (this.config[i].state.toLowerCase() === transitionTo.toLowerCase()) {
                    returnValue = i;
                    break;
                }
            } else {
                returnValue = 0;
                break;
            }
        }
        
        return returnValue;
    } else {
        return ++currentIndex; 
    }
};

StateMachine.prototype.getReply = function (stateIndex, session, request, event, data) {
    var reply;
    var otherwise;
    var deleteState = false;
    if (this.config[stateIndex].choices) {
      var choices = this.config[stateIndex].choices;
      for (var i = 0; i < choices.length; i++ ) {

            if (choices[i].choice.toLowerCase() === data[ ""+stateIndex].toLowerCase()) {
                reply = choices[i].reply;
                if (choices[i].postAction) {
                  if (choices[i].postAction.toLowerCase() === "stop") {
                     deleteState = true;
                   }

             }
         }

         if (choices[i].choice === "*") {
            otherwise = choices[i].reply;
         }
      }
       
      if (!reply && otherwise) {
         reply = otherwise;
      }

    } else {
        if (this.config[stateIndex].transition) {
            var returnValue = 0;
            var transitionTo =  this.config[stateIndex].transition(session, request, event);
    
            for (var i = 0; i < this.config.length; i++ ) {
                if (this.config[i].state) {
                    if (this.config[i].state.toLowerCase() === transitionTo.toLowerCase()) {
                        returnValue = i;
                        reply = this.config[returnValue].reply;
                        break;
                    }
                } else {
                    deleteState = true;
                    reply = "Error in event.states[" + i + "]: state property not set for transition."
                    break;
                }
            }
            
        } else {
            reply = this.config[stateIndex].reply;
        }
    }

     var extraInstructions = "";
     if (this.config[stateIndex].instructions) {
        extraInstructions += "\n "+this.config[stateIndex].instructions;
    }
 
   if (!deleteState) {
     extraInstructions += "\n text 'X' to cancel and start over";
   }   
    if (event.html && stateIndex == 0) {
        extraInstructions += " or (U)I for a User Interface"
    }

    var result = (typeof(reply) == 'function' ? reply(session, request, event,data) : reply) + (this.config.length === stateIndex + 1 ?  "" : extraInstructions);
    
    if (this.config[stateIndex].postAction) {
         if (this.config[stateIndex].postAction.toLowerCase() === "stop" ) {
            session.Delete(request.phone);
         }
    } 

    if (deleteState) { session.Delete(request.phone); }

    return result;
};

StateMachine.prototype.description = function (stateIndex) {
    return this.config[stateIndex].desc;
};

var strip = function(validator) {
   return validator.split(':')[0];
}


module.exports = StateMachine;
