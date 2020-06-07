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
var folks = require("../../services/folks");
var scheduledservice = require("../../services/scheduled");
var StateService = require('../../services/stateservice');
var config = require('../../config');
var pug = require('pug');



var host_url = config.url;
var template_dir = config.template_dir;
var capacity = 8;

var cache = null;
folks.folks().then(function (f) { cache = f; });
scheduledservice.scheduled().then(function (f) { cache = f; });


var left = function (session, request, event, data) {

    mongo.Get({ phone: request.phone }, 'office')
        .then(function (list) {

            if (list.length > 0) {
                mongo.Update({ phone: request.phone }, { firstname: request.me.FirstName, lastname: request.me.LastName, date: new Date, in: false, phone: request.phone }, "office", { upsert: true });
                folks.refresh();

            }
        });

    return "Thanks, you have been checked out";

}



var today = function (session, request, event, data) {

    mongo.Get({ in: true }, 'office')
        .then(function (list) {

            if (list.length > capacity) {

                return "Sorry there are already " + list.length + " scheduled to be in the office";

            }

            console.log(JSON.stringify(request));

            mongo.Update({ phone: request.phone }, { firstname: request.me.FirstName, lastname: request.me.LastName, date: new Date, in: true, phone: request.phone }, "office", { upsert: true });
            folks.refresh();


        });

    return "Thanks, please text 'office' with the '(L)eft' option, when you leave";

}


var who = function (session, request, event, data) {

    var results = " Folks currently in Office \n";

    console.log(JSON.stringify(folks.cached()));

    var list = folks.cached();

    var now = new Date();
    for (i in list) {

        // if not today delete
        if (list[i].date.getFullYear() == now.getFullYear() && list[i].date.getMonth() == now.getMonth() && list[i].date.getDate() == now.getDate()) {

            if (list[i].in) {
                results += list[i].firstname + " " + list[i].lastname + "\n";
            }

        } else {


            mongo.Delete({ phone: request.phone }, "office");
            folks.refresh();

        }

    }

    return results;

}




var scheduled = function (session, request, event, data) {

    var d = new Date();
    var weekday = new Array(7);
    weekday[0] = "su";
    weekday[1] = "mo";
    weekday[2] = "tu";
    weekday[3] = "we";
    weekday[4] = "th";
    weekday[5] = "fr";
    weekday[6] = "sa";

    var n = d.getDay();
    var days = "Enter day(s) you plan on being in office, comma delimited (";
    for (var i = n; i < 7; i++) {
        days += weekday[i] + ',';

    }

    days = days.substring(0, days.length - 1) + ') or C to cancel';

    return days;


}



var schedule = function (session, params, event, data) {

    var days;

    if (data.length < 3) {

        return "No days specified...";
    } 


    if (data[2].toLowerCase() == "c") {

        mongo.Delete({ phone: params.phone }, "Scheduled");
        scheduledservice.refresh();

        return "Schedule has been cancelled ";
    }


    try {

        days = data[2].split(',');

    } catch (e) {

        return "Invalid days format, they should be comma delimited (i.e. mo,tu,we,thu...)";

    }

    mongo.Update({ phone: params.phone }, { phone: params.phone, name: params.me.FirstName + ' ' + params.me.LastName, days: days, date: new Date() }, "Scheduled", { upsert: true });
    scheduledservice.refresh();

    return "Thanks, you are scheduled for " + JSON.stringify(data[2])

}





var done = function (session, request, event, data) {


    return "Ok, done";
}




module.exports = function (events) {

    var event = {};
    event.states = [
        { reply: 'Working In Office? (T)oday, W(h)o is in (S)cheduled (L)eft', validator: 'choice:t,s,h,l', desc: 'working-in-office' },
        {
            choices: [{ choice: 't', reply: today, desc: 'today', postAction: 'stop' },
            { choice: 's', reply: scheduled, desc: 'scheduled' },
            { choice: 'h', reply: who, desc: 'who', postAction: 'stop' },
            { choice: 'l', reply: left, desc: 'left', postAction: 'stop' },
            ]
        },
        { reply: schedule, desc: 'schedule', postAction: 'stop' }


    ];
    event.isAuth = false;
    event.description = "Office Schedule";
    event.words = [{
        word: 'office',
        value: 10
    },

    {
        word: 'o',
        value: 10
    }


    ]
    event.threash = 10;
    event.run = function (params) {

        return new Promise(function (resolve, reject) {
            return resolve(StateService.doStates(event, params));
        });

    }
    event.html = function (request) {
        // Compile the source code
  
        var compiledFunction = pug.compileFile(template_dir + '/office/office.pug');

        var date = new Date();
        
        var adjust = -1 * (0 - date.getDay()); 

        date.setDate(date.getDate() - adjust);

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var dow = month + "/" + day + "/" + year;

        var report = [
            { dow: 'Monday', folks: [] },
            { dow: 'Tuesday', folks: [] },
            { dow: 'Wednesday', folks: [] },
            { dow: 'Thursday', folks: [] },
            { dow: 'Friday', folks: [] },
            { dow: 'Saturday', folks: [] },
            { dow: 'Sunday', folks: [] }

        ]

        var list = scheduledservice.cached();

        console.log(JSON.stringify(list));

        for (var i = 0; i < list.length; i++) {

          var start = date.setDate( date.getDate() - 1  );
          if (list[i].date > date) {  

            for (var j = 0; j < list[i].days.length; j++) {

                if (list[i].days[j].toLowerCase() == 'mo') {

                    report[0].folks.push(list[i].name);

                } 
                
                if (list[i].days[j].toLowerCase() == 'tu') {

                    report[1].folks.push(list[i].name);

                }

                if (list[i].days[j].toLowerCase() == 'we') {

                    report[2].folks.push(list[i].name);

                }

                if (list[i].days[j].toLowerCase() == 'th') {

                    report[3].folks.push(list[i].name);

                }

                if (list[i].days[j].toLowerCase() == 'fr') {

                    report[4].folks.push(list[i].name);

                }


                if (list[i].days[j].toLowerCase() == 'sa') {

                    report[5].folks.push(list[i].name);

                }


                if (list[i].days[j].toLowerCase() == 'su') {

                    report[6].folks.push(list[i].name);

                }


            }

          }  



        }

    

        return compiledFunction({ url: host_url, date: dow , results: report });
    }





    events.push(event);

}


var inOffice = function (params) {


    return new Promise(function (resolve, reject) {


        //mongo.Get({phone: params.phone},"Users").then(
        mongo.Get({ Phone: params.phone }, "Users").then(

            function (u) {

                if (u.length > 0) {

                    var user = u[0];

                    mongo.Update({ phone: params.phone }, { phone: phone, name: u.FirstName + u.LastName, date: new Date() }, "Office", { upsert: true });


                    return resolve("Thanks " + user.FirstName + " for checking in");

                } else {

                    return resolve(params.Username + "Not found...");

                }


            }
        );



    });


}








