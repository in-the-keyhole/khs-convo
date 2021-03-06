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

var moment = require('moment');

module.exports = function (events) {

    var event = {};
    event.isAuth = false;
    event.description = "Get Date Time";
    event.words = [{
        word: 'date',
        value: 10
    }, {
        word: 'time',
        value: 10
    }]
    event.threash = 10;
    event.run = function (result) {
        return new Promise(function (resolve, reject) {
            var response = "";

            if ((/date/g).test(result.question))
                response += moment(Date.now()).format('LL') + " ";
             
             if ((/time/g).test(result.question))
                response += moment(Date.now()).format('LTS');

            return resolve(response.trim());
        });
    }

    events.push(event);

}
