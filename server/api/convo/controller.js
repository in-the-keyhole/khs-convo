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

const ConvoService = require('../../services/convo');
const mongo = require('../../services/mongo');
const ObjectId = require('mongodb').ObjectID;
const uuid = require('uuid');
const request = require('request');
const config = require('../../config');
const events = require('../../services/convo/events');
const Promise = require('promise');

const client = require('twilio')(
    config.twilio.accountSid,
    config.twilio.authToken);

const util = require('util');

function get(req, res) {
    const sortField = req.query.sortField ? req.query.sortField : '_id';
    const sortOrder = req.query.sortOrder ? parseInt(req.query.sortOrder) : '-1';
    mongo.GetSort({}, { [sortField]: sortOrder  }, 'Convos')
        .then(function (contact) {
            res.send(contact);
        });
}

function getvisitorschunk(req, res) {
    const sortField = req.query.sortField ? req.query.sortField : '_id';
    const sortOrder = req.query.sortOrder ? parseInt(req.query.sortOrder) : '-1';
    mongo.GetSortByChunk({}, {  [sortField]: sortOrder  }, 'Visitors', parseInt(req.query.limitCount), parseInt(req.query.skipCount))
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
    const sortField = req.query.sortField ? req.query.sortField : '_id';
    const sortOrder = req.query.sortOrder ? parseInt(req.query.sortOrder) : '-1';
    const filters = req.query.filters; // Implies companion filters param
    if (!filters) {
        mongo.GetSortByChunk({}, {[sortField]: sortOrder}, 'Convos',
            parseInt(req.query.limitCount), parseInt(req.query.skipCount))

            .then( data => res.send(data));
    } else {
        const collection = 'Convos';
        _getFilteredSortedPaginatedChuck({req, res, sortField, sortOrder, filters, collection});
    }
}

// Local-only helper augments any chunked, sorted, paginated collection to also have single-field filtering
function _getFilteredSortedPaginatedChuck({req, res, sortField, sortOrder, filters, collection}) {

    // 1. Create a MongoDB composite "AND query" from the filters. Use a regexp for each comparision constant
    const utf8 = Buffer.from(filters, 'base64').toString('utf8');
    console.log(`query reconstituted to utf8 JSON:`, utf8);

    const qobj = JSON.parse(utf8);
    console.log(`query as object:`, qobj);

    // Convert args to regexp
    for(const v in qobj){
        if (qobj.hasOwnProperty(v)){
            qobj[v] = new RegExp(qobj[v]);
        }
    }
    console.log(`query augmented to regxp 'LIKE' values:`, qobj);

    // 2. Query filtered, sorted chunked  result array. (Remember, it's only a page of it)
    const promise = mongo.GetSortByChunk(
        qobj,
        {[sortField]: sortOrder},
        collection,
        parseInt(req.query.limitCount),
        parseInt(req.query.skipCount));

    // 3. Capture unchunked result size
    promise.then( (data) => {
        // return new Promise( resolve => resolve({data: data, size: data.length}) );
        return  new Promise( resolve => {
            mongo.GetCount(qobj, collection).then( count => {
                resolve( {data: data, totalSize: count} )
            });
        })

    }).then( dto => {
        // 4. Keep a data chunk: (for first iteration) use skipCount of 0; use inbound limit
        return new Promise( resolve => {
            const v = Object.assign({}, dto);
            v.skipCount = 0; // We'd like this to move across subsequent calls. How to manage?
            v.limitCount = Math.min(req.query.limitCount, v.data.length);
            v.data = v.data.slice(v.skipCount, v.limitCount);
            resolve(res.send(v));
        });
    });

}

// Optional MongoDB query expression defaults to "all"
function getconvocount(req, res) {
    const query = req.query || {};
    mongo.GetCount(query, 'Convos')
        .then( data => {
            res.send(data);
        });
}

function getduplicates(req, res) {
    //let dupes = ConvoService.duplicates();
    //console.log(dupes);
    res.send(ConvoService.duplicates());
}

function getgroupquestion(req, res) {
    let i;
    let questionsArr = [];

    for (i = 0; i < req.body.length; i++) {
        questionsArr.push(req.body[i].replace("'", ""));
    }

    let allQuestions = [];
    for (i = 1; i < questionsArr.length; i++) {
        allQuestions[i] = questionsArr[i].charAt(0).toUpperCase() + questionsArr[i].slice(1);
    }

    for (i = 1; i < allQuestions.length; i++) {
        questionsArr.push(allQuestions[i]);
    }

    mongo.Aggregate([
        {
            "$group": {_id: { tag: '$question', lower: { $toLower: '$question' } },//"count": { "$sum": 1 },
                "count": {"$sum": {"$cond": [{"$anyElementTrue": {"$map": {"input": questionsArr, "as": "el", "in": { "$eq": ["$$el", "$question"] }}}}, 1, 0]}}}
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
                    if: { $eq: ["$count", 0] },
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
    let i;
    const textArr = [];
    for (i = 0; i < array.length; i++) {
        textArr.push(array[i].text);
    }

    const sorted_arr = textArr.slice().sort();
    const dupTexts = [];
    for (i = 0; i < sorted_arr.length - 1; i++) {
        if (sorted_arr[i + 1] === sorted_arr[i]) {
            dupTexts.push(sorted_arr[i]);
        }
    }

    for (i = 0; i < dupTexts.length; i++) {
        const text = dupTexts[i];
        const obj = {};
        let count = 0;

        for (let j = 0; j < array.length; j++) {
            if (array[j].text === text) {
                count += array[j].count;
            }
        }
        obj.count = count;
        obj.text = text;
        obj.value = count;

        array = array.filter( (obj) => {
            return obj.text !== text;
        });

        array.push(obj);
    }

    return array;
}

function getgroupphone(req, res) {
    mongo.Aggregate(
        [{
            "$group": {
                _id: "$phone", count: { $sum: 1 }
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
    const phone = req.query.phone;
    const skipCount = parseInt(req.query.skip) || 0;
    const limitCount = parseInt(req.query.limit) || 20;
    const query = {phone: phone, question: {$ne: "availablecommands"}};
    mongo.GetSortByChunk(query, { date: -1 }, 'Convos', limitCount, skipCount)
        .then(function (conversation) {
            res.send(conversation);
        });
}

// const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

function post(req, res) {
    const body = req.body['Body'] || req.body['body'];

    const result = {};
    result.phone = req.body.From.replace(/[()\-+]/g, "");
    if (result.phone.charAt(0) === '1') {
        result.phone = result.phone.slice(1, result.phone.length);
    }

    // ************************************************************
    // Could not determine why the 2 commented out lines were doing
    // what they are doing, so changed it to just splitting on a space
    // and not converting the entire "sub" to lowerCase, but rather
    // just trimming them.  If no ill effects are seen because of
    // this change, the commented out lines below can be removed.

    //var sub = body.match(/([a-zA-Z0-9\+\*\/\-\!\?'])+/gm);
    const sub = body.split(' ');
    for (let i = 0; i < sub.length; i++) {
        //sub[i] = sub[i].toLowerCase().trim();
        sub[i] = sub[i].trim();
    }
    // ************************************************************

    result.question = sub;
    result.rawQuestion = body;
    result.raw = req.body;
    result.scheduleDate = req.body['scheduleDate'];

    if (!isTokenValid(req)) {
        res.end("Invalid API token");
        return;
    }

    ConvoService.findAnswer(result)
        .then(function (result) {
            const twiml = new MessagingResponse();
            // IMPORTANT: don't change date to moment format
            mongo.Insert({ date: new Date(), phone: result.phone, question: result.rawQuestion, answer: result.answer, word: result.word }, 'Convos');
            mongo.Update({ phone: result.phone }, { phone: result.phone, lastaccessdate: new Date() }, "Visitors", { upsert: true });
            twiml.message(result.answer);

            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
        }).catch(function (e) { console.log(e); });

}

function timesheetnotification(req, res) {
    const allConvoUsers = req.body;
    const notificationText = req.query.text;

    // noinspection JSUnresolvedVariable
    request({
        url: config.timesheet.url + '/sherpa/service/convo/latesttimeentries',
        method: 'GET'
    }, function (error, response, body) {
        let k;
        const timesheetsDueUserNames = [];
        const allLatestEntriesUserNames = [];

        const client = require('twilio')(
            config.twilio.accountSid,
            config.twilio.authToken
        );

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastSunday = new Date(today.setDate(today.getDate() - today.getDay()));
        const minDate = new Date();
        minDate.setDate(lastSunday.getDate() - 7);

        const tsDueUsers = JSON.parse(body);

        for (k = 0; k < tsDueUsers.length; k++) {
            allLatestEntriesUserNames.push(tsDueUsers[k].userName);
        }
        //console.log('All latest time entries: ' + util.inspect(tsDueUsers));

        for (k = 0; k < tsDueUsers.length; k++) {
            let entry = tsDueUsers[k].day.split("-");
            let entryDate = new Date(entry[0], entry[1] - 1, entry[2]);
            if (entryDate < minDate) {
                timesheetsDueUserNames.push(tsDueUsers[k].userName);
            }
        }
        console.log('All DUE latest time entry usernames: ' + util.inspect(timesheetsDueUserNames));

        const phones = retrieveDueTimesheetPhones(allConvoUsers, allLatestEntriesUserNames, timesheetsDueUserNames);

        const uniquePhones = phones.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });

        for (let i = 0; i < uniquePhones.length; i++) {
            //console.log('SEND TEXT TO: +1'+uniquePhones[i]);

            client.messages.create({
                from: '+' + config.twilio.phone,
                to: '+1' + uniquePhones[i],
                body: notificationText
            });
        }

        res.send("Notifications Sent");
    });
}

function retrieveDueTimesheetPhones(all, allLatestEntriesUserNames, timesheetsDueUserNames) {
    const phoneNumbers = [];

    for (let i = 0; i < all.length; i++) {
        for (let j = 0; j < timesheetsDueUserNames.length; j++) {
            if (all[i].Username === timesheetsDueUserNames[j]) {
                phoneNumbers.push(all[i].Phone.replace(/\D/g, ''));
            }
        }
    }

    return phoneNumbers;
}


function geteventstatus(req, res) {

    const events = req.body.events;

    mongo.Get({ name: { $in: events } }, "disabled")
        .then(function (result) {
            res.send(result);
        })
}

/**
 * If req.body.eventStatus; is 'enabled" then remove the record for the input key (req.body.key).
 * Othewise, "upsert" the record designted by the input key.
 *
 * Notice that req.body.key is the application-level key, but we use the primarty key,, _id provided by
 * Mongodb.
 *
 * @param req
 * @param res
 */
function disableevent(req, res) {
    const query = { _id: ObjectId(req.body._id) };
    const status = req.body.eventStatus;
    const collection = 'disabled';

    if (status === 'enabled') {
        mongo.Delete(query, collection)
            .then( result => res.send(result));
    } else {
        mongo.Update(query, { name: req.body.key }, collection, { upsert: true })
            .then( (result) => res.send(result));
    }
}


function inactivecommand(req, res) {
    const id = uuid();
    const body = req.body['Body'] || req.body['body'];
    let phone = req.body.From.replace(/[()\-+]/g, "");
    if (phone.charAt(0) === '1') {
        phone = phone.slice(1, phone.length);
    }
    const convo = [{
        date: new Date(),
        phone: phone,
        question: body,
        answer: "\'" + body + "\' has been disabled",
        word: ''
    }];

    mongo.Insert(convo, 'Convos')
        .then( (result) => console.log(result));

    convo.id = id;
    res.send(convo);
}


/**
 * Sed an SMS text message
 * @param req
 * @param res
 */
function sms(req, res) {

    const request = processRequest(req);

    let event;
    const convo = request.question[0];

    if (!isTokenValid(req)) {
        res.end("Invalid API token");
        return;
    }

    return new Promise(function (resolve) {

        // noinspection JSUnresolvedVariable
        for (let i = 0; i < events.length; i++) {
            for (let j = 0; j < events[i].words.length; j++) {
                if (events[i].words[j].word.toLowerCase() === convo.toLowerCase()) {
                    event = events[i];
                    break;
                }
            }
        }

        if (event) {

            mongo.Get({ Phone: request.phoneto }, 'Users')
                .then(function (contact) {
                    if (contact != null)
                        request.me = contact[0];
                    if (event.isAuth) {
                        if (!contact.length) {
                            request.answer = "No Auth: Please Contact Admin!";
                            return resolve(request);
                        }
                    }

                    event.run(request)
                        .then(function (answer) {
                            request.answer = answer;
                            client.messages.create({
                                from: '+' + config.twilio.phone,
                                to: '+1' + request.phoneto,
                                body: answer
                            }).then( () => console.log(answer));


                            return resolve(request);
                        });

                });


            // noinspection JSUnresolvedVariable
            res.send("Executed: " + event.Description);

        } else {

            res.sendStatus(403);
        }

    });
}

function processRequest(req) {

    const result = {};
    const body = req.body['Body'] || req.body['body'];

    result.phoneto = body.To.replace(/[()\-+]/g, "");
    result.phonefrom = body.From.replace(/[()\-+]/g, "");
    result.phone = body.From.replace(/[()\-+]/g, "");

    if (result.phoneto.charAt(0) === '1') {
        result.phoneto = result.phoneto.slice(1, result.phoneto.length);
    }

    if (result.phonefrom.charAt(0) === '1') {
        result.phonefrom = result.phonefrom.slice(1, result.phonefrom.length);
    }

    // const sub = body.match(/([a-zA-Z0-9\+\*\/\-\!\?'])+/gm);
    const sub = body.match(/([a-zA-Z0-9]|\+|\*|\/|-|\?)+/gm);
    for (let i = 0; i < sub.length; i++) {
        sub[i] = sub[i].toLowerCase().trim();
    }

    result.question = sub;
    result.rawQuestion = body;
    result.raw = req.body;

    return result;
}

function isTokenValid(req) {
    let token = req.headers['token'];
    if (token) {
        if (token === config.api_token) {
            return true;
        }
    }

    const body = req.body['Body'] || req.body['body'];
    // noinspection JSUnresolvedVariable
    token = body.AccountSid;
    if (token) {
        if (token === config.api_token) {
            return true;
        }
    }

    return false;
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
    geteventstatus: geteventstatus,
    disableevent: disableevent,
    inactivecommand: inactivecommand,
    timesheetnotification: timesheetnotification,
    sms: sms
};
