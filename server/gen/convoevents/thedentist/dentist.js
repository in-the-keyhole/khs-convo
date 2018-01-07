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
var request = require("request");
var session = require("../../services/session");
var fs = require('fs');
var mongo = require("../../services/mongo");
var StateService = require('../../services/stateservice');
var config = require('../../config');
var pug = require('pug');

var host_url = config.url;
var template_dir = config.template_dir;

module.exports = function (events) {

    var event = {};
    event.states = [
        { reply: 'What is your Dental problem (B)roken Tooth (T)ooth Pain (G)um Pain (O)ther ?', validator: 'choice:b,t,g,o', desc: 'Pain' },
            {choices: [
                  { choice: 'b', reply: 'Would you like to have video chat w/Dentist (Y)es (N)o ?', validator: 'choice:y,n' },
                  { choice: 't', reply: 'Would you like to have video chat w/Dentist (Y)es (N)o ?', validator: 'choice:y,n' },
                  { choice: 'g', reply: 'Would you like to have video chat w/Dentist (Y)es (N)o ?', validator: 'choice:y,n' },
                  { choice: 'o', reply: 'Please text a short description of problem'}
                ]
        },
             {choices: [
                 { choice: 'Y', reply: videoLink, postAction: 'cancel', validator: 'choice:y,n' },
                 { choice: 'n', reply: 'Ok, would you like to Schedule Appt. (Y)es (N)o ? ', validator: 'choice:y,n'},
                 { choice: '*', reply: 'Ok, would you like to Schedule Appt. (Y)es (N)o ? ', validator: 'choice:y,n'} 
         ]},
                   

                     {choices: [
                        { choice: 'n', reply: 'Thank you, goodbye', postAction: 'stop' },
                        { choice: 'y', reply: 'Ok, you have an appt scheduled at The Dentist is in at: \n 123 easy Street \n Somewhere USA \n  123-222-3333', postAction: 'stop' }]
        }

    ];

    event.isAuth = false;
    event.description = "Dentist is in";
    event.words = [{
        word: 'pain',
        value: 10
    }, {
        word: 'dentist',
        value: 10
    }]
    event.run = function (request) {
        return new Promise(function (resolve, reject) {

            return resolve(StateService.doStates(event, request));
        });
    }

    events.push(event);

};


var videoLink = function(session,request,event) {

        var compiledFunction = pug.compileFile(template_dir+'/thedentist/dentist.pug');

        var html = compiledFunction( { url: host_url} );    
        var word = event.words[0].word;
        var result = '\n Link to Video Chat  -->\n'+host_url+'api/public/html/'+request.phone+'/'+word;
                    mongo.Update({phone: result.phone, event: word},{phone: request.phone, event: word, html: html }, "ui", {upsert: true} );   
                    
        session.Delete(request.phone);
              

    return result;
}


