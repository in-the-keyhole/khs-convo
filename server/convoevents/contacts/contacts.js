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

var mongo = require('../../services/mongo');

module.exports = function (events) {

    var event = {};
    event.isAuth = true;
    event.description = "Contacts";
    event.words = [{
        word: 'phone',
        value: 10
    }, {
        word: 'number',
        value: 10
    }, {
        word: 'contact',
        value: 10
    }]
    event.threash = 10;
    event.run = function (result) {
        return new Promise(function (resolve, reject) {
            mongo.Get({}, 'Users')
                .then(function (contacts) {
                    var reContacts = [];
                    for (var i = 0; i < contacts.length; i++) {
                        var contact = contacts[i];
                        var match = false;
                        for (var x = 0; x < result.question.length; x++) {
                            var question = result.question[x].toLowerCase().trim();
                            if (question === "" || question === null || question.length < 3) {
                                continue;
                            }
                            var fname = contact.FirstName.toLowerCase().trim().match(RegExp(question)) || [];
                            var lname = contact.LastName.toLowerCase().trim().match(RegExp(question)) || [];
                            if (fname.length > 0 || lname.length > 0) {
                                if (match) {
                                    return resolve(contact.FirstName + " " + contact.LastName + ": " + contact.Phone);
                                }
                               match = true;
                               reContacts.push(contact);
                            }
                        }

                    }
                    var e = "";
                    for (var i = 0; i < reContacts.length; i++) {
                        var reContact = reContacts[i];
                        e += reContact.FirstName + " " + reContact.LastName + ": " + reContact.Phone;
                        if (reContacts.length > 0 && i < reContacts.length) {
                            e += "\n\r";
                        }
                    }

                    if (reContacts.length == 0) {
                        return resolve("No Contacts Found");
                    }
                    return resolve(e);
                });
        });
    }

    events.push(event);

}
