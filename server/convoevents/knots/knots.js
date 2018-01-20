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

var StateMachine = require("../../services/state-machine");
var session = require("../../services/session");
var mongo = require("../../services/mongo");
var config = require('../../config');
var StateService = require('../../services/stateservice');
var pug = require('pug');

var host_url = config.url;
var template_dir = config.template_dir;

var knots = [
  {id: 'a', image:'knots/arbor_knot.png', desc: 'Arbor Knot, good for tying backing to reel spool', type: 'L'},
  {id: 'b', image:'knots/blood_knot.png', desc: 'Blood Knot, good for joining lines', type: 'T'},
  {id: 'r', image:'knots/albright-knot.jpeg', desc: 'Albright Knot, good for joining lines of different diameters', type: 'T'},
  {id: 's', image:'knots/surgeons.jpg', desc: 'Surgeons Knot, good for tying tippet to leader', type: 'T'},
  {id: 'l', image:'knots/clinch-knot.jpg', desc: 'Clinch Knot, good for tying  fly to leader', type: 'F'},
  {id: 'o', image:'knots/orvis-knot.png', desc: 'Orvis small easy to tie strong knot for tying  fly to leader', type: 'F'},
  {id: 'p', image:'knots/perfectionloop.jpeg', desc: 'Perfection Loop, good for loop to loop connection', type: 'L'},
  {id: 'n', image:'knots/nail-knot.jpg', desc: 'Nail Knot, good for joining Fly line to leader, in leiu of loop connection', type: 'L'},
  {id: 'm', image:'knots/mono-loop.jpeg', desc: 'Non Slip Mono Loop, good for tying streamers to leader', type: 'F'},
  {id: 'd', image:'knots/davyknot.jpg', desc: 'Davey, small easy to tie knot for tying  fly to leader', type: 'F'},
 ];

module.exports = function (events) {

    var event = {};

    event.states = [
        { reply: 'Type of Knot? (L)ine to Leader, (F)ly to Line, Leader to (T)ippet', validator: 'choice:l,f,t', desc: 'knot-type' }, 
        { choices: [{ choice: 'l', reply: '(A)rbor, (N)ail, (P)erfection', validator: 'choice:a,b,n,p', desc: 'knots' }, 
                    { choice: 'f', reply: 'c(L)inch, (D)avey, (M)ono Loop, (N)ail, (O)rvis', validator: 'choice:d,l,m,n,o', desc: 'knots' }, 
                    { choice: 't', reply: 'Alb(R)ight (B)lood, (S)urgeon ', validator: 'choice:r,b,s', desc: 'knots'}]
                  }, 
        { reply:  types, desc: 'Types' }
    ];
    event.isAuth = false;
    event.description = "Knots";
    event.words = [{
      word: 'knot',
      value: 10
    }, 
    { 
      word: 'knots',
      vaue: 10
    }];
    event.threash = 10;
    event.run = function (request) {
      return new Promise(function (resolve, reject) {
        return resolve(StateService.doStates( event, request ));
      });
    };

    event.html = function(request) {
      // Compile the source code
      var compiledFunction = pug.compileFile(template_dir + '/knots/knots.pug');

      var knotTypes = {
        all: knots,
        lineToLeader: knots.filter(function(knot) {
          return knot.type === 'L';
        }),
        flyToLine: knots.filter(function(knot) {
          return knot.type === 'F';
        }),
        tibbetKnots: knots.filter(function(knot) {
          return knot.type === 'T';
        })
      }

      return compiledFunction({ url: host_url, knots: knotTypes });
    } 

    events.push(event);
}


var types = function (session, request, event, data) {

      var t = data["2"].toLowerCase();
      var knot;
      for (var i = 0; i < knots.length; i++) {
           if (knots[i].id === t) {
               knot = knots[i]; 
           }
      }
      
       mongo.Get({phone: request.phone}, 'Sessions')
        .then(function (list) {
             session.Delete(request.phone);
        });

      return knot.desc+" - diagram link --> "+host_url+knot.image;

}


