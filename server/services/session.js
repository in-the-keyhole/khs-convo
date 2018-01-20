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
var moment = require('moment');

module.exports = {
    Remember: Remember,
    Get: Get,
    Delete: Delete,
    GetCurrent: GetCurrent,
    Replace: Replace

}



function Replace(phone, event, msg, state, data) {

    var conversation = {};
    var d =  new Date(); //moment(Date.now()).format('LLLL');
    mongo.Update({ phone: phone},{ date: d, phone: phone, event: event, message: msg, state: state, data: data }, 'Sessions', {upsert: true});

}


function Remember(phone, event, msg, state) {

    var conversation = {};
    var d =  new Date(); //moment(Date.now()).format('LLLL');
    mongo.Insert({ date: d, phone: phone, event: event, message: msg, state: state }, 'Sessions');


}


function GetCurrent(phone) {


    return new Promise(function (resolve, reject) {
        var result;
        mongo.Get({ phone: phone }, 'Sessions').then(function (results) {
            var index = results.length;
           
            if (index >= 0) {
                result = results[index-1];
            }

        
            return resolve(result);

        });
    });



}


function Get(phone) {


    return new Promise(function (resolve, reject) {

        var result = mongo.Get({ phone: phone }, 'Sessions');
        return resolve(result);
    });



}



function Delete(phone) {

     mongo.Get({phone: phone}, 'Sessions')
        .then(function (list) {
             mongo.Delete({ phone: phone }, 'Sessions');
        });            

    return true;



}
