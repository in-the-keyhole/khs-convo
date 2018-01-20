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

var StateService = require('../../services/stateservice');

module.exports = function (events) {

    var event = {};
    event.states = [
        { reply: 'Your appointment is tommorrow at 1:00 pm, can you make it (Y)es or (N)o?', validator: 'choice:y,n', desc: 'Appointment' },
            {choices: [
                  { choice: 'y', reply: 'Thank you, see you on 11/1/2017 @ 1:00', postAction: 'stop' },
                  { choice: 'n', reply: 'Would you like to schedule a different Date (Y)es (N)o ?', validator: 'choice:y,n' }]
        },
             {choices: [
                 { choice: 'Y', reply: 'Ok, what day', validation: 'date:future' },
                 { choice: 'n', reply: 'Goodbye, call this number to reschedule 123-456-7890', postAction: 'stop' }
                ]
        },
         { reply: 'See on Monday at 1:00 a.m ', desc: 'Appointment Made', postAction: 'stop' }
    ];

    event.isAuth = false;
    event.description = "My Appointment";
    event.words = [{
        word: 'appointment',
        value: 10
    }, {
        word: 'appt',
        value: 10
    }]
    event.run = function (request) {
        return new Promise(function (resolve, reject) {
            return resolve(StateService.doStates(event, request));
        });
    }

    events.push(event);
}

var dateResponse = function (session, request, event, data) {
  var date = request.question[0];
  return "Ok, what time (24hr format) would you like to be scheduled for on " + date + "?";
}

var timeResponse = function (session, request, event, data) {
  var time = request.rawQuestion;
  var date = new Date(data[1]);

  return "Great, your appointment is scheduled for " + time + " on " + date.toDateString() + ". \nCall this number to reschedule 123-456-7890";
}

var apptLookup = function( session, request, event, data ) {
  return new Promise(function (resolve, reject) {
    request("http://somehost/appt/"+request.phone, function (error, response, body) {
        return resolve("Your appointmemnt is at "+body.dateTime);
    });
  });
}
