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


/*
    Load Convo Events
*/

var Loader = require('../../eventloader');


var events = [];
//require('./datetime')(events);
//require('./hello')(events);
//require('./timesheet')(events);
//require('./math')(events);
require('./help')(events);
//require('./tips')(events);
//require('./tailwater')(events);
//require('./conversion')(events);
//require('./knots')(events);

//require('./unix-timestamp')(events);
//require('./contacts')(events);
//require('./transition')(events);
//require('./movies')(events);
//require('./showtimes')(events);
var l =new Loader();
l.loadevents(undefined,events);

module.exports = events;
