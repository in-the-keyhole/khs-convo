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


var fs = require('fs');
var config = require('../config');
const util = require('util');

function Loader() {
   
}

Loader.prototype.loadevents = function (path,events) {

    if (!path) {
        path = config.event_dir;
    }

    fs.readdir(path, function (err, filenames) {
        if (err) {
            console.log(err);
            return;
        }
        filenames.forEach(function (filename, index) {
            fs.stat(path + '/' + filename, function (err, stats) {

                if (stats.isDirectory()) {
                    var l = new Loader();


                    l.loadevents(path + '/' + filename,events);
                    return;
                } else {
                    if (filename.indexOf(".js") > 0 && filename.indexOf("index.js") < 0) {

    
                        try {
                            require('../../'+path + '/' + filename)(events);
                        } catch (e) {

                            console.log("Error Loading Event..." + filename);
                            console.log(e);
                            return;

                        }
                        events[(events.length-1)].filename = filename;     
                        console.log("Loaded Event  - " + filename);
                    }
                }
            }
            );
        });
    });

    if (path && path.indexOf('upload...') > -1) {
        var arr = path.split('...');
        const convoEventPath = 'convoevents/' + arr[2];
        try {
            require('../'+ convoEventPath + '/' + arr[1])(events);
        } catch (e) {
            console.log("Error Loading Single Event..." + arr[1]);
            throw(new Error(e.toString()));
        }
        console.log("Loaded Single Event  - " + arr[1]);
    }
}

//module.exports = { loadevents: loadevents };
module.exports = Loader;
