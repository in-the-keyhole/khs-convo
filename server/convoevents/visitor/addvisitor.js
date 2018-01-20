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
module.exports = function (events) {

    var event = {};
    event.isAuth = false;
    event.description = "Add Visitor";
    event.words = [{
        word: 'visitor',
        value: 10
    }]
    event.run = function (request) {
        console.log(request);
        return new Promise(function (resolve, reject) {
            if (request.me) {
                return resolve("You have been add " + request.me.FirstName + "!");
            } else {
                return resolve("You have been added.");
            }
        })
    }

    events.push(event);

}


