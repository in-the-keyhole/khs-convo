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

var request = require("request");
var session = require("../../services/session");
var fs = require('fs');
var mongo = require("../../services/mongo");
var StateService = require('../../services/stateservice');


module.exports = function (events) {

    var event = {};

    event.states = [
        {reply: "What is your age?", validator: 'number', desc: 'age'},
        {
            reply: "What is your zipcode?",
            validator: validZipcode,
            desc: 'zipcode'/*, transition: function(discriminators) { return 1; }*/
        },
        {reply: quote}
    ];

    event.isAuth = false;
    event.description = "SVG Quote";
    event.threash = 10;

    event.words = [{
        word: 'medicare',
        value: 11,
        input: 'yes'
    }];

    event.run = function (request) {

               return new Promise(function (resolve, reject) { 
                        
                        return resolve(StateService.doStates( event, request )); });

    };

    events.push(event);
};


var validZipcode = function (session, request, event) {
    var zips = ["66209", "66206", "66213", "66210", "66211", "64108", "64137"];
    var zip = request.question[0];
    if (zips.indexOf(zip) >= 0) {
        return undefined;
    }
    return "Valid Zip Code please " + zips;
};

var quote = function (session, request, event, data) {
    var answer;
    var link = "https://rates.web.unitedmedicareadvisors.net/#/results?age=" + data[1] + "&zipCode=" + data[2];
    answer = "Click this link to review your quote\n " + link + " Thank you!";

   mongo.Get({phone: request.phone}, 'Sessions')
        .then(function (list) {
             session.Delete(request.phone);
    });

    return answer;
};
