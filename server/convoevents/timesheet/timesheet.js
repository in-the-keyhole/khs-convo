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

var config = require('../../config');
var moment = require('moment');
var http = require('http');
var request = require("request");
var sRequest = require("sync-request");
var session = require("../../services/session");
var mongo = require("../../services/mongo");
var StateService = require('../../services/stateservice');

var timesheet_host = config.timesheet.host;
var timesheet_port = config.timesheet.port;
var timesheet_url = config.timesheet.url;

module.exports = function (events) {

    var event = {};

    event.states = [
        {reply: "Handle timesheet / add call and start the flow.", desc: '0', transition: begin, state: 'begin'},
        {reply: getNewOrPrevious, desc: '1', transition: newOrPrevious, state: 'newOrPrevious'},
        {reply: getClientList, desc: '2', transition: newClient, state: 'newClient' },
        {reply: getDay, desc: '3', transition: newDay, state: 'newDay'},
        {reply: getHours, desc: '4', transition: newHours, state: 'newHours'},
        
        {reply: getLatestTimeEntry, desc: '5', transition: changePreviousEntries, state: 'changePreviousEntries'},
        {reply: getHours, desc: '6', transition: changeHours, state: 'changeHours'},
        {reply: getClientList, desc: '7', transition: changeClient, state: 'changeClient'},
        {reply: getDay, desc: '8', transition: changeDay, state: 'changeDay'},

        {reply: getNotes, desc: '9', transition: newNotes, state: 'newNotes'},
        {reply: addTimesheet, desc: '10', state: 'addTimesheet'},
        {reply: emailError, desc: 'Email Error', state: 'emailError'}
    ];

    event.isAuth = false;
    event.description = "Timesheet Entry";
    event.threash = 10;

    event.words = [{
        word: 'timesheet',
        value: 10
    }, {
        word: 'add',
        value: 5
    }]

    event.run = function (request) {
        return new Promise(function (resolve, reject) {
             return resolve(StateService.doStates(event, request));
         });
     }
     events.push(event);
}

var TimesheetEntry = {};

var Clients = null;

var firstTimeThrough = true;

var begin = function(session, request, event){
    //check email against a regular expression
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var isValidEmail =  re.test(request.me.Username);

    if (!isValidEmail) {
        return "emailError";
    }

    var answer =  request.rawQuestion;
    return "newOrPrevious";
}

var emailError = function(session, request, event) {
    session.Delete(request.phone);
    return "Error: A valid Email Address is required in the convo system to use Time Entry. Please contact HR.";
}

var getNewOrPrevious = function(session, request, event) {
    return "(N)ew Entry or Create from (P)revious?";
};

var newOrPrevious = function(session, request, event) {
    var answer =  request.rawQuestion;
    
    firstTimeThrough = true;
    
    TimesheetEntry = {
        clientName: "client",
        userName: request.me.Username,
        day: moment().format("MM/DD/YYYY"),
        hours: 8,
        notes: "default notes"
    }

    if (answer.toLowerCase() == "n") { return "newClient"; }
    else if (answer.toLowerCase() == "p") {return "changePreviousEntries";}
    else {return "newOrPrevious";}
};

// Get last timesheet entry from md-timesheet for this user
var getLatestTimeEntry = function (session, request, event) {

    if (firstTimeThrough) {

        firstTimeThrough = false;

        var opt = {
            url: timesheet_url + '/sherpa/service/convo/mylatestentry/' + request.me.Username,
            method: 'GET'
        };
        
        var res = sRequest(opt.method, opt.url, opt);
        if (res.statusCode !== 200) {
            return "Error getting Latest Time Entry for: " + request.me.Username;
        }
        var entry = JSON.parse(res.getBody('utf8'));
        
        if (Object.keys(entry).length === 0) {
            // no previous entries. check for clients.
            Clients = getClients(request);
            if (Clients.length > 0) {
                TimesheetEntry.clientName = Clients[0]; //default to the first one
            } else {
                return "Error getting Clients for Timesheet. Please contact HR."; // no clients setup in Timesheet system.
            }
        } else {
            TimesheetEntry.clientName = entry.clientName;
            TimesheetEntry.hours = entry.hours;
            TimesheetEntry.notes = entry.notes;
        }
    }
    
    return "Add " + TimesheetEntry.hours + " hours to " + TimesheetEntry.clientName + " for " + TimesheetEntry.day + "?\n(Y)es\nChange: (C)lient, (H)ours, (D)ay.";
    
};

var getClientList = function (session, request, event) {
    Clients = getClients(request);
    return "Please enter one of your assigned Clients (listed below):\n\n" + Clients;
};

var getDay = function (session, request, event) {
    if (validateDay(TimesheetEntry.day)) {
        return "Enter a Date (MM/DD/YYYY).";    
    }
    return "Please Enter a Valid Date in MM/DD/YYYY format.";
}

var getHours = function (session, request, event) {
    if (validateHours(TimesheetEntry.hours)) {
        return "Enter Hours";
    }
    return "Please Enter Valid Hours.";
}

var getNotes = function (session, request, event) {
    if (validateNotes(TimesheetEntry.notes)) {
        return "Enter Notes.";
    }
    return "Please Enter Valid Notes.";
}

var newClient =  function(session, request, event) {
    TimesheetEntry.clientName = request.rawQuestion; //comes in as lowercase

    if (validateClient(TimesheetEntry.clientName)) {
        return "newDay";
    }
    return "newClient";
};

var newDay = function(session, request, event){ 
    TimesheetEntry.day =  request.rawQuestion;

    if (validateDay(TimesheetEntry.day)) {
        return "newHours";
    }
    return "newDay";
};

var newHours = function (session, request, event) {
    TimesheetEntry.hours = parseFloat(request.rawQuestion) || ""; //comes in as lowercase

    if (validateHours(TimesheetEntry.hours)) { 
        return "newNotes";
    }
    return "newHours"; 
};

var newNotes = function (session, request, event) {
    TimesheetEntry.notes = request.rawQuestion || ""; //comes in as lowercase

    if (validateNotes(TimesheetEntry.notes)) { 
        return "addTimesheet";
    }
    return "newNotes"; 
};

var changePreviousEntries = function(session, request, event){ 
    var answer =  request.rawQuestion;

    if (answer.toLowerCase() == "h") {return "changeHours";}
    else if (answer.toLowerCase() == "c") {return "changeClient";}
    else if (answer.toLowerCase() == "d") {return "changeDay";}
    else if (answer.toLowerCase() == "y") {return "newNotes";}
    else {return "changePreviousEntries";}
}; 

var changeClient = function(session, request, event){ 
    TimesheetEntry.clientName = request.rawQuestion; //comes in as lowercase
    
    if (validateClient(TimesheetEntry.clientName)) {
        return "changePreviousEntries";
    }
    return "changeClient";
};

var changeDay = function(session, request, event){ 
    TimesheetEntry.day =  request.rawQuestion;
    
    if (validateDay(TimesheetEntry.day)) {
        return "changePreviousEntries";
    }
    return "changeDay";
};

var changeHours = function(session, request, event){ 
    TimesheetEntry.hours = parseFloat(request.rawQuestion) || ""; //comes in as lowercase
    
    if (validateHours(TimesheetEntry.hours)) { 
        return "changePreviousEntries";
    }
    return "changeHours";         
};

function getClients(request) {
    // Generate valid list of clients from md-timesheet for this user
    var opt = {
        url: timesheet_url + '/sherpa/service/convo/myclients/' + request.me.Username,
        method: 'GET'
    };

    var res = sRequest(opt.method, opt.url, opt);
    if (res.statusCode !== 200) {
        //return "Error Loading Client List - "+ res.statusCode;
        return "Error Loading Client List for: " + request.me.Username;
    }
    return JSON.parse(res.getBody('utf8'));
}

function validateClient(client) {
    return (Clients.indexOf(client.toLowerCase()) >= 0);
};

function validateDay(day){ 
    var d = moment(day, ["MM/DD/YYYY","MM-DD-YYYY","M/D/YYYY"], true);
    if (d.isValid()) {
        TimesheetEntry.day = moment(d).format("MM/DD/YYYY");
        return true;
    }
    return false;
};

function validateHours(hours) {
    return !(Number.isNaN(parseFloat(hours)) ||  parseFloat(hours) < 0.0 || parseFloat(hours) > 24.0);
};

function validateNotes(notes){ 
    return (notes.length >= 1 && notes.length <= 1000);
};

var addTimesheet = function (session, request, event) {

    // pass it to the timesheet convo api
    var opt = {
        host: timesheet_host,
        port: timesheet_port,
        path: '/sherpa/service/convo/timesheetentry',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    var req = http.request(opt, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (d) {
                //console.log("response: ", d);
            });
        });
        
    req.on('error', function (e) {
        console.log("error: ", e);
    });
    
    req.write(JSON.stringify(TimesheetEntry));
    req.end();

    session.Delete(request.phone);
    
    return TimesheetEntry.hours + " hours for " + TimesheetEntry.clientName + " on " + TimesheetEntry.day + " has been added.\nEnter 'timesheet' or 'add' to input more Time.";
    
};




