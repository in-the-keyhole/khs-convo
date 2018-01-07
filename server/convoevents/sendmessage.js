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

var config = require('../config');

module.exports = function (events) {

    var event = {};
    event.isAuth = false;
    event.description = "Send Message";
    event.words = [{
        word: 'send',
        value: 10
    }]
    event.run = function (request) {
        console.log(request);
        return new Promise(function (resolve, reject) {

          
           var client = require('twilio') (
                 config.twilio.accountSid,
                 config.twilio.authToken
           ); 
          
          return resolve(  client.messages.create( {

                from: '+19132703506'  ,
                to:   '+19134885577',
                body:  'Hello World'        

               }).then( function(msg) { console.log('test...');  }  ) );

           

        })
    }

    events.push(event);

}
