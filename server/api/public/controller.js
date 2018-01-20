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

var ConvoService = require('../../services/convo');
var mongo = require('../../services/mongo');
var moment = require('moment');
var fs = require('fs');
var Loader = require('../../services/eventloader');

var events = [];
var l = new Loader();
l.loadevents(undefined,events);

function tailwaterHTML(req, res) {

  var stream = ""; 
  var write =  function(value) {
    stream = stream + value;
  };

  mongo.GetSort({}, {state: 1, name: 1}, 'Tailwater')
      .then(function (list) {
        write("<head>");
        write("<meta name='viewport' content='width=device-width, initial-scale=1'>");
        write( '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css">');
        write("</head>");

        write("<div class='container'>");
        write("<div class='row'>");
        write("<div class='col-md-7'>");
        write("<h2>Realtime Tailwater and Stream Info via Text Message</h2> <h3><em>by <a href='http://keyholesoftware.com'>keyholesoftware.com</a></h3>");
        write("</div>");
        write("</div>");
        write("<div class='row'>");
        write("<div class='col-md-7'>");
        write("<h3> <p> text -> gen 'SMS name' </p></h3>");
        write("</div>");
        write("</div>");
        write("<div class='row'>");
        write("<div class='col-md-7'>");
        write("<table class='table'>" );
        write("<tr><th>State</th><th>Description</th><th>SMS Id Name</th>");

        for (var i = 0; i < list.length; i++) {
          write("<tr><td>"+list[i].state.toUpperCase()+"</td><td>"+list[i].name+"</td><td>"+list[i].location+"</td></tr>");
        }    

        write("</table");
        write("</div>");
        write("</div>");
        write("</div>");

        res.send(stream);
    });
}

function generateQuote(req,res) {
  var phone = req.params.phone;

  mongo.Get({ phone: phone  }, 'Quotes')
    .then(function (quotes) {
      if (quotes.length > 0) {
         res.send(quotes[quotes.length - 1].quote);
      } else {
         res.send("No Quotes Found");
      }
    });
}

function generateConversion(req,res) {
  var phone = req.params.phone;
      
  mongo.Get({ phone: phone }, 'Conversions')
      .then(function (c) {
          if (c.length > 0) {
             res.send(c[c.length - 1].conversion);
          } else {
             res.send("No Conversions Found");
          }
      });
}

function generateUI(req,res) {
  var phone = req.params.phone;
  var event = req.params.event;
      
  mongo.Get({ phone: phone, event: event }, 'ui')
    .then(function (c) {
      if (c.length > 0) {
         res.send(c[c.length - 1].html);
      } else {
         res.send("No UI HTML Found");
      }
    });
}
  

function html(req,res) {

     var html = '';
     var event = req.params.event;

     console.log(events);

     for (var i = 0; i < events.length; i++) {

       var words = events[i].words; 
      
       var ev = words.find( function(e) { return e.word == event }); 
  
       if (ev) {
      
  
        res.send(events[i].html());
        return;
       }  
     
     } 

}


module.exports = {
  tailwaterHTML: tailwaterHTML,
  generateQuote: generateQuote,
  generateConversion: generateConversion,
  generateUI: generateUI,
  html:html
}
