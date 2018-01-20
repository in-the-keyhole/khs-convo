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

function get(req, res) {
        mongo.GetSort({}, {state: 1, name: 1}, 'Tailwater')
            .then(function (contact) {
                res.send(contact);
            });
}

function postInsert(req, res) {

    console.log(req.body);

    if (req.body.id) {
        mongo.Update({ id: req.body.id},req.body, 'Tailwater', {upsert: true})
            .then(function (contact) {
              //  generateHTML();
                res.send(req.body);
            })
    }
}

function postUpdate(req, res) {

    console.log(req.body);

    var _this = this;
    if (req.body.id) {
        mongo.Update({ id: req.body.id }, req.body, 'Tailwater')
            .then(function (contact) {

               // generateHTML();
                res.send(req.body);

            })
    }
}

function remove(req, res) {

    if (req.body.id) {
        mongo.DeleteOne(req.body.id, 'Tailwater')
            .then(function (contact) {
                res.send(contact);
            })
    }
}


function tailwaterHTML(req, res) {

   var stream = ""; 
   var write =  function(value) {

        stream = stream + value;

   };

    mongo.GetSort({}, {state: 1, name: 1},'Tailwater')
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
              //  stream.write("</div>");
              //  stream.end();

                 res.send(stream);

              });

           

   
}









function generateHTML() {


    mongo.GetSort({}, {state: 1, name: 1},'Tailwater')
        .then(function (list) {

            var stream = fs.createWriteStream("public/tailwater.html");
            stream.once('open', function (fd) {
                stream.write("<head>");
                stream.write("<meta name='viewport' content='width=device-width, initial-scale=1'>");
                stream.write( '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css">');
                stream.write("</head>");

                stream.write("<div class='container'>");
                 stream.write("<div class='row'>");
                     stream.write("<div class='col-md-7'>");
                      stream.write("<h2>Realtime Tailwater and Stream Info via Text Message</h2> <h3><em>by <a href='http://keyholesoftware.com'>keyholesoftware.com</a></h3>");
                     stream.write("</div>");
                stream.write("</div>");
                stream.write("<div class='row'>");
                stream.write("<div class='col-md-7'>");
                  stream.write("<h3> <p> text -> gen 'SMS name' </p></h3>");
                stream.write("</div>");
                stream.write("</div>");
                stream.write("<div class='row'>");
                stream.write("<div class='col-md-7'>");
                stream.write("<table class='table'>" );
                stream.write("<tr><th>State</th><th>Description</th><th>SMS Id Name</th>");
                for (var i = 0; i < list.length; i++) {

                    write("<tr><td>"+list[i].state.toUpperCase()+"</td><td>"+list[i].name+"</td><td>"+list[i].location+"</td></tr>");

                }    

                write("</table");
                write("</div>");
                write("</div>");
                write("</div>");
              //  stream.write("</div>");
                



              });

           
        });

   
}



module.exports = {
    postInsert: postInsert,
    postUpdate: postUpdate,
    get: get,
    remove: remove,
    generateHTML: generateHTML,
    tailwaterHTML: tailwaterHTML
}
