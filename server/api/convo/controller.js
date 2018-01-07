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
var uuid = require('uuid');
var moment = require('moment');
var request = require('request');
var config = require('../../config');


const util = require('util');

function get(req, res) {
    mongo.GetSort({}, {_id: -1}, 'Convos')
            .then(function (contact) {
                res.send(contact);
            });
}

function getvisitorschunk(req, res) {
    mongo.GetSortByChunk({}, {_id: -1}, 'Visitors', parseInt(req.query.limitCount), parseInt(req.query.skipCount))
        .then(function (visitor) {
             res.send(visitor);
        });
}

function getvisitorscount(req, res) {
    mongo.GetCount({}, 'Visitors')
        .then(function (visitor) {
             res.send(visitor);
        });
}

function getconvochunk(req, res) {
    mongo.GetSortByChunk({}, {_id: -1}, 'Convos', parseInt(req.query.limitCount), parseInt(req.query.skipCount))
        .then(function (contact) {
             res.send(contact);
        });
}

function getconvocount(req, res) {
    mongo.GetCount({}, 'Convos')
        .then(function (contact) {
             res.send(contact);
        });
}

function getduplicates(req, res) {
    //let dupes = ConvoService.duplicates();
    //console.log(dupes);
    res.send(ConvoService.duplicates());
}

function getgroupquestion(req, res) {
    let questionsArr = [];

    for(var i=0; i<req.body.length;i++) {
        questionsArr.push(req.body[i].replace("'", ""));
    }

    let allQuestions = [];
    for(var i = 1 ; i < questionsArr.length ; i++){
        allQuestions[i] = questionsArr[i].charAt(0).toUpperCase() + questionsArr[i].slice(1);
    }

    for(var i = 1 ; i < allQuestions.length ; i++){
        questionsArr.push(allQuestions[i]);
    }

    mongo.Aggregate([
            {
            "$group" : {
                _id: {  tag: '$question', lower: { $toLower : '$question' } },
                //"count": { "$sum": 1 },
                "count": {
                    "$sum": {
                         "$cond": [
                             { "$anyElementTrue": { "$map": {
                                 "input": questionsArr,
                                 "as": "el",
                                  "in": { "$eq": [ "$$el", "$question" ] }
                              }}},
                              1,
                              0
                         ]
                     }
                }
            }
            },
            {
                $project: {
                    _id: 0,
                    text: "$_id.lower",
                    count: 1,
                    value: "$count"
                }
            },
            {
                $redact: {
                  $cond: {
                    if: { $eq: [ "$count", 0 ] },
                    then: '$$PRUNE',
                    else: '$$DESCEND'
                  }
                }
              }
            ]
            , 'Convos')
        .then(function (contact) {
            res.send(cleanUpGroupByQuestions(contact));
        });
}

function cleanUpGroupByQuestions(array) {
    var textArr = [];
    for (var i = 0; i < array.length; i++) {
        textArr.push(array[i].text);
    }

    var sorted_arr = textArr.slice().sort();
    var dupTexts = [];
    for (var i=0; i < sorted_arr.length-1; i++) {
        if (sorted_arr[i + 1] == sorted_arr[i]) {
            dupTexts.push(sorted_arr[i]);
        }
    }

    for (var i=0; i<dupTexts.length; i++) {
        var text = dupTexts[i];
        var obj = {};
        var count = 0;

        for (var j=0; j<array.length; j++) {
            if (array[j].text == text) {
                count += array[j].count;
            }
        }
        obj.count = count;
        obj.text = text;
        obj.value = count;

        array = array.filter(function( obj ) {
            return obj.text !== text;
        });

        array.push(obj);
    }

    return array;
};

function getgroupphone(req, res) {
    mongo.Aggregate(
            [{
                "$group" : {
                    _id: "$phone", count:{$sum:1}
                }
            },
            {
                $project: {
                    _id: 0,
                    text: "$_id",
                    count: 1,
                    value: "$count"
                }
            }]
            , 'Convos')
        .then(function (contact) {
            res.send(contact);
        });
}


function getConvoForPhone(req, res) {
    var phone = req.query.phone;
    var skipCount = parseInt(req.query.skip) || 0;
    var limitCount = parseInt(req.query.limit) || 20;
    var query = {phone: phone, question: {$ne: "availablecommands"}};
    mongo.GetSortByChunk(query, {date: -1}, 'Convos', limitCount, skipCount)
        .then(function (conversation) {
            res.send(conversation);
        });
}

var twilio = require('twilio');
var MessagingResponse = require('twilio').twiml.MessagingResponse;

function post(req, res) {
    var body = req.body['Body'] || req.body['body'];
    var result = {};
    result.phone = req.body.From.replace(/[\(\)\-\+]/g, "");
    if (result.phone.charAt(0) === '1') {
        result.phone = result.phone.slice(1, result.phone.length);
    }
    var sub = body.match(/([a-zA-Z0-9\+\*\/\-\!\?'])+/gm);
    for (var i = 0; i < sub.length; i++) {
        sub[i] = sub[i].toLowerCase().trim();
    }


    result.question = sub;
    result.rawQuestion = body;
    result.raw = req.body;
    //console.log(result);
    ConvoService.findAnswer(result)
        .then(function(result) {
            var twiml = new MessagingResponse();
            // IMPORTANT: don't change date to moment format
            mongo.Insert({ date: new Date(), phone: result.phone, question: result.rawQuestion, answer: result.answer, word: result.word}, 'Convos');
            mongo.Update( {phone: result.phone}, { phone: result.phone , lastaccessdate: new Date() }  , "Visitors", { upsert: true } );
            twiml.message(result.answer);

            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
        }).catch( function(e) { console.log(e); });

}

function timesheetnotification(req, res) {
    var allConvoUsers = req.body;
    var notificationText = req.query.text;

    request({
        url: config.timesheet.url + '/sherpa/service/convo/latesttimeentries',
        method: 'GET'
    }, function(error, response, body){
        var timesheetsDueUserNames = [];
        var allLatestEntriesUserNames = [];

        var client = require('twilio') (
            config.twilio.accountSid,
            config.twilio.authToken
        );

        let now = new Date();
        let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let lastSunday = new Date(today.setDate(today.getDate()-today.getDay()));
        let minDate = new Date();
        minDate.setDate(lastSunday.getDate() - 7);

        let tsDueUsers = JSON.parse(body);

        for (var k=0;k<tsDueUsers.length;k++){
            allLatestEntriesUserNames.push(tsDueUsers[k].userName);
        }
        console.log('All latest time entries: ' + util.inspect(tsDueUsers));

        for (var k=0;k<tsDueUsers.length;k++){
            let entry = tsDueUsers[k].day.split("-");
            let entryDate = new Date(entry[0], entry[1]-1, entry[2]);
            if (entryDate < minDate) {
                timesheetsDueUserNames.push(tsDueUsers[k].userName);
            }
        }

        console.log('All DUE latest time entry usernames: ' + util.inspect(timesheetsDueUserNames));

        let phones = retrieveDueTimesheetPhones(allConvoUsers, allLatestEntriesUserNames, timesheetsDueUserNames)

        let uniquePhones = phones.filter(function(elem, index, self) {
            return index === self.indexOf(elem);
        })

        for(var i=0;i<uniquePhones.length;i++) {
            client.messages.create( {
                from: '+19132703506',
                to: '+1'+uniquePhones[i],
                body: notificationText
            })
        }

        res.send("Notifications Sent");
    });
}

function retrieveDueTimesheetPhones(all, allLatestEntriesUserNames, timesheetsDueUserNames) {
    var phoneNumbers = [];
    for (var k=0;k<all.length;k++) {
        if (all[k].Username == undefined || allLatestEntriesUserNames.indexOf(all[k].Username) == 0) {
            phoneNumbers.push(all[k].Phone.replace(/\D/g,''));
        }
    }
    for (var i=0;i<all.length;i++) {
        for (var j=0;j<timesheetsDueUserNames.length;j++) {
            if (all[i].Username == timesheetsDueUserNames[j]) {
                phoneNumbers.push(all[i].Phone.replace(/\D/g,''));
            }
        }
    }

    return phoneNumbers;
}


function geteventstatus(req, res){

    var events = req.body.events;

    mongo.Get({ name:{$in: events} }, "disabled")
    .then(function (result) {
        res.send(result);
    })
}

function disableevent(req, res) {
    var event = req.body.event.key;
    var status = req.body.event.status;

    if (status == 'enabled') {
        mongo.Delete({ name: event }, "disabled")
            .then(function (result) {
                res.send(result);
            })
    } else {
        mongo.Update({ name: event }, { name: event }, "disabled", { upsert: true })
            .then(function (result) {
                res.send(result);
            })
    }
}


function inactivecommand(req, res) {
    var id = uuid();
    var body = req.body['Body'] || req.body['body'];
    var phone = "";
    phone = req.body.From.replace(/[\(\)\-\+]/g, "");
    if (phone.charAt(0) === '1') {
        phone = phone.slice(1, phone.length);
    }
    var convo = [{
        date: new Date(),
        phone: phone,
        question: body,
        answer: "\'" + body + "\' has been disabled",
        word:''
    }]

    mongo.Insert(convo, 'Convos')
    .then(function (result) {
    });

    convo.id =id;
    res.send(convo);
}



module.exports = {
    post: post,
    get: get,
    getvisitorschunk: getvisitorschunk,
    getvisitorscount: getvisitorscount,
    getconvochunk: getconvochunk,
    getconvocount: getconvocount,
    getgroupquestion: getgroupquestion,
    getgroupphone: getgroupphone,
    getduplicates: getduplicates,
    getconvoforphone: getConvoForPhone,
    geteventstatus:geteventstatus,
    disableevent:disableevent,
    inactivecommand:inactivecommand,
    timesheetnotification: timesheetnotification
}
