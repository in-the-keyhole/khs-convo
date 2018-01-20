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

//http://samples.openweathermap.org/data/2.5/weather?q=London,uk&appid=b1b15e88fa797225412429c1c50c122a1
'use strict';

var request = require('sync-request');
var moment = require('moment');

module.exports = function (events) {

    var event = {};
    event.isAuth = false;
    event.description = "Weather information";
    event.words = [{
        word: 'wx',
        value: 10
    }, {
        word: 'weather',
        value: 10
    }, {
        word: 'temp',
        value: 10
    }, {
        word: 'tempeture',
        value: 10
    }]
    event.threash = 10;
    event.run = function (result) {
        return new Promise(function (resolve, reject) {
            var opt = {
                method: 'GET',
                url: 'http://api.openweathermap.org/data/2.5/weather?q=' + result.raw.FromCity + ',' + result.raw.FromState + '&appid=b1b15e88fa797225412429c1c50c122a1'
            };
            console.log(opt);
            var response = request(opt.method, opt.url, opt);
            if (response.statusCode !== 200) resolve("Error Loading Weather Data - "+response.statusCode);

            var wx = JSON.parse(response.getBody('utf8'));
            var r = "";
            if ((/temp/gm).test(result.rawQuestion)) {
                r += 'Temp: ' + wx.main.temp;
            }
            return resolve(r);
        })
    }

    events.push(event);

}
