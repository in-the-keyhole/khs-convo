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

    const event = {};
    event.isAuth = false;
    event.description = "Say Hello";
    event.words = [{
        word: 'hello',
        value: 10
    }, {
        word: 'hi',
        value: 10
    }];

    event.run = function (request) {
        console.log(request);
        // noinspection ES6ModulesDependencies
        return new Promise(function (resolve) {
            const msg = request.me
                ? "Hello " + request.me.FirstName + "!"
                : "Hello!";
            return resolve(msg);
        })
    };

    events.push(event);

};
