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
var StateService = require('../../services/stateservice');
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

    event.states = [
        { reply: 'Movie Name?', validator: movievalidate, desc: 'name' },
        { reply: getShowtimes, instructions: '(A)ll Movies, (B)uy Tickets ', validator: 'choice:a,b', desc:'movie showtime'},
        { choices: [
            { choice: 'b', reply: buytickets, postAction: 'cancel' },
            { choice: 'a', reply: allMovies, postAction: 'cancel' }]
        }
    ];

    event.isAuth = false;
    event.description = "Movie Showtimes";
    event.threash = 10;

    event.words = [
    {
        word: 'movie',
        value: 10
    }, 
    {
        word: 'showtime',
        value: 10
    },
    {
        word: 'showtimes',
        value: 10
    }];

    event.run = function (request) {
        return new Promise(function (resolve, reject) {
            return resolve(StateService.doStates( event, request ));
        });
    };

    events.push(event);
};

var movielist = function() {
    var result = [];
    for (var i = 0; i < movies.length; i++) {
        result.push(movies[i].name);
    }
    return result;
}

var movieForName = function(name) {
    var movie;
    for (var i = 0; i < movies.length; i++) {
        if (movies[i].name.toLowerCase() === name.toLowerCase()) {
            movie = movies[i];
            break;
        }
    }
    return movie;
}

var movievalidate = function(session, request, event, data) {
    var movie = request.question[0];
    for (var i = 0; i < movies.length; i++) {
        if (movies[i].name.toLowerCase() === movie.toLowerCase()) {
            return undefined;
        }
    }
    return "Enter one of these movies please - " + movielist().join(', ');
}

var getShowtimes = function (session, request, event, data) {   
     var result;
     var movieInput = data[1];
     for (var i = 0; i < movies.length; i++) {
        if (movies[i].name.toLowerCase() === movieInput.toLowerCase()) {
            result = movies[i].locations.join(', ');
            break;
        }
     }
    return result;
};

var buytickets = function(session, request, event, data) {
    var compiledFunction = pug.compileFile('templates/buytickets.pug');

    var html = compiledFunction({ url: host_url, movie: movieForName(data[1]) });
    var word = event.words[0].word;
    var result = 'Text "movie" for another movie. \n Link to buy tickets for '+movieForName(data[1]).name+' --> '+host_url+'api/public/html/'+request.phone+'/'+word;
    mongo.Update({phone: result.phone, event: word},{phone: request.phone, event: word, html: html }, "ui", {upsert: true} );

    session.Delete(request.phone);

    return result;
}

var allMovies = function(session, request, event, data) {

    var compiledFunction = pug.compileFile('templates/allmovies.pug');

    var html = compiledFunction( { url: host_url, movies: movies} );
    var word = event.words[0].word;
    var result = 'Text "movie" for another movie. \n Link to all Movies --> '+host_url+'api/public/html/'+request.phone+'/'+word;
    mongo.Update({phone: result.phone, event: word},{phone: request.phone, event: word, html: html }, "ui", {upsert: true} );

    session.Delete(request.phone);

    return result;
}
