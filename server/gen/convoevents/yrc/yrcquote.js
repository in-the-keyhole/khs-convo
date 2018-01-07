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

var request = require("request");
var session = require("../../services/session");
var fs = require('fs');
var mongo = require("../../services/mongo");
var StateMachine = require("../../services/state-machine");
var config = require('../../config');

var host_url = config.url;


module.exports = function (events) {

    var event = {};

    var states = [
        {
            reply: "Destination Zipcode ?",
            validator: validDest,
            desc: 'Destination'/*, transition: function(discriminators) { return 1; }*/
        },
        {reply: "Weight (lbs) ?", validator: 'number', desc: 'Weight'},
        {reply: "Height (ft) ?", validator: 'number', desc: 'Height'},
        {reply: "Width (ft) ?", validator: 'number', desc: 'Width'},
        {reply: "Length (ft) ?", validator: 'number', desc: 'Length'},
        {reply: quote}
    ];

    var stateMachine = new StateMachine(states);

    event.isAuth = false;
    event.description = "YRC Quote";
    event.threash = 10;

    event.words = [{
        word: 'quote',
        value: 10,
        input: 'yes'
    }];

    event.run = function (request) {

        return new Promise(function (resolve, reject) {

            session.GetCurrent(request.phone)
                .then(function (savedSession) {

                    var currentState = savedSession && savedSession.state ? savedSession.state : 0;
                    
                    // if past initial state, then validate
                    if (currentState > 0) {
                        var error = stateMachine.validate(currentState - 1 , session, request, event);
                        if (error) {
                            return resolve(error);
                        }
                    }

                    // compute and store nextState
                    var nextState = stateMachine.getNextState(currentState, session, request, event);
                    session.Remember(request.phone, "quote", stateMachine.description(currentState) + " = " + request.question[0], nextState, currentState);

                    // compute and resolve reply for this state
                    var answer = stateMachine.getReply(currentState, session, request, event);
                    return resolve(answer);
                })
                .catch(function (rejection) {
                    console.log("session promise failed:", rejection);
                });
        });
    };

    events.push(event);
};


var validDest = function (session, request, event) {
    var zips = ["66209", "66206", "66213", "66210", "66211", "64108", "64137"];
    var zip = request.question[0];
    if (zips.indexOf(zip) >= 0) {
        return undefined;
    }
    return "Valid Zip Code please " + zips;
};

var quote = function (session, request, event) {
    var answer;
    var link = host_url+"api/public/quote/" + request.phone;
    answer = "Your quote is $1m dollars...Thank you for using YRC DFQ. Click this link to review \n " + link;
    generateQuote(session, request, event);
    return answer;
}

function generateQuote(session, request, event) {
    // var filePath = "./public/"+request.phone+"dfq.html";
    //fs.unlinkSync(filePath);
    var stream = "";
    var write = function (value) {
        stream = stream + value;
    };

    mongo.Get({phone: request.phone}, 'Sessions')
        .then(function (list) {
            //  var stream = fs.createWriteStream(filePath);
            // stream.once('open', function (fd) {
            write("<head>");
            write("<meta name='viewport' content='width=device-width, initial-scale=1'>");
            write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css">');
            write("</head>");

            write("<div class='container'>");
            write("<div class='row'>");
            write("<div class='col-md-7'>");
            write("<h2>YRC Dimensional Freight Quote</h2> <h3><em>by <a href='http://yrc.com'>yrc.com</a></h3>");
            write("</div>");
            write("</div>");

            write("<div class='row'>");
            write("<div class='col-md-7'>");
            write("<table class='table'>");

            for (var i = 0; i < list.length; i++) {
                write("<tr><td>" + list[i].message + "</td></tr>");
            }

            write("<tr><td>Quote = $1,000,000.00</td></tr>");

            write("<tr><td><a href='https://my.yrc.com/dynamic/national/servlet?CONTROLLER=com.rdwy.ec.rextransactionalquote.http.controller.TransactionalQuoteEntryController&DESTINATION=/rextransactionalquote/rqTransactionalQuoteEntry.jsp&ERRORDESTINATION=/rextransactionalquote/rqTransactionalQuoteEntry.jsp'>YRC DFQ Link</a></td></tr>");

            write("</table");
            write("</div>");

            write("</div>");

            write("</div>");
            //stream.end();

            mongo.Insert({phone: request.phone, quote: stream}, "Quotes");

            session.Delete(request.phone);
        });
    // });
}
