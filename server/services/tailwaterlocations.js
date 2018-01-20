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

var mongo = require('./mongo');


var waters = null;

module.exports = {
    locations: locations,
    refresh: refresh
    
}



function locations() {

    return new Promise(function (resolve, reject) {
       mongo.Get({}, 'Tailwater')
        .then(function (contact) {
            //console.log(contact);
            waters = contact;
            return resolve(waters);
        });
    
    });   


}


function refresh() {

     return new Promise(function (resolve, reject) {
      mongo.Get({}, 'Tailwater')
        .then(function (contact) {
            waters = contact;
            return resolve(waters);
        });
     });


}

