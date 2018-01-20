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
var mongo = require("../../services/mongo");
var config = require('../../config');
var pug = require('pug');

var host_url = config.url;

var movies = [
    { name: 'Dunkirk', locations: ['Ward Parkway 14 (6:00, 9:00)', 'AMC 20 (3:00, 8:00)' ], image: 'movies/dunkirk.jpeg'},
    { name: 'Hitman Bodyquard', locations: ['Ward Parkway 14 (4:00, 6:00)', 'AMC 20 (7:00, 10:00)' ], image: 'movies/hitmanbodyguard.jpeg'},
    { name: 'It', locations: ['Ward Parkway 14 (6:00, 9:00)', 'AMC 20 (3:00, 8:00)' ], image: 'movies/it.jpeg'}
];

module.exports = function (events) {
    var event = {};

    event.isAuth = false;
    event.description = "Movies";
    event.threash = 10;

    event.words = [{
        word: 'movies',
        value: 10
    }];

    event.run = function (request) {
        return new Promise(function (resolve, reject) {
            return resolve(allMovies(event, request)); 
        });
    };

    events.push(event);
};

var allMovies = function(event, request) {
    var compiledFunction = pug.compileFile('templates/allmovies.pug');

    var html = compiledFunction({ url: host_url, movies: movies });
    var word = event.words[0].word;
    var result = 'Text "movie" for times, locations, and ticket purchase \n Link to all movies --> '+host_url+'api/public/html/'+request.phone+'/'+word;
    mongo.Update({phone: result.phone, event: word},{phone: request.phone, event: word, html: html }, "ui", {upsert: true});

    session.Delete(request.phone);

    return result;
}
