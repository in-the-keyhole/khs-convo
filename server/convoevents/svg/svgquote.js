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

const mongo = require("../../services/mongo");
const StateService = require('../../services/stateservice');


const validZipcode = function (session, request) {
    const zips = ["66209", "66206", "66213", "66210", "66211", "64108", "64137"];
    const zip = request.question[0];
    if (zips.indexOf(zip) >= 0) {
        return undefined;
    }
    return "Valid Zip Code please " + zips;
};

const quote = function (session, request, event, data) {
    const link = "https://rates.web.unitedmedicareadvisors.net/#/results?age=" + data[1] + "&zipCode=" + data[2];
    const answer = `Click this link to review your quote
 ${link} Thank you!`;

   mongo.Get({phone: request.phone}, 'Sessions')
        .then(function () {
             session.Delete(request.phone);
    });

    return answer;
};

module.exports = function (events) {

    const event = {};

    event.states = [
        {
            reply: "What is your age?", validator: 'number', desc: 'age'},
        {
            reply: "What is your zipcode?",
            validator: validZipcode,
            desc: 'zipcode'/*, transition: function(discriminators) { return 1; }*/
        },
        {
            reply: quote
        }
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

        // noinspection ES6ModulesDependencies
        return new Promise(function (resolve) {
            return resolve(StateService.doStates(event, request));
        });

    };

    events.push(event);
};


