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


const fs = require('fs-extra');


const filterFunc =  (s => {

    // noinspection JSUnresolvedFunction
    if (fs.lstatSync(s).isDirectory() && s.indexOf('.git') < 0) {
        return true;
    }

    return s.toLowerCase().indexOf('.js') > 0;
});


// noinspection JSUnresolvedFunction
fs.copySync('/Users/davidpitt/git/khs-convo-sms-events' ,
    '/Users/davidpitt/git/khs-grok-convo/server/convoevents',{filter: filterFunc } );
console.log("Success, convos copied");
