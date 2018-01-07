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
var tailwaters = require("../../services/tailwaterlocations");

module.exports = function (events) {


    var locations = null;
    locations = tailwaters.locations().then( function(waters) { locations = waters;  } );
   // mongo.Get({}, 'Tailwater')
   //     .then(function (contact) {
            //console.log(contact);
   //         locations = contact;
   //     });


    var event = {};
    var tw = tailwaters;
    event.isAuth = false;
    event.description = "Tailwater Generation";
    event.words = [{
        word: 'generation',
        value: 10
    },
    {
        word: 'gen',
        value: 10
    },
    {
        word: 'tailwater',
        value: 10
    },
    {
        word: 'tail',
        value: 10
    },
    {
        word: 'water',
        value: 10
    }

    ]
    event.threash = 10;
    event.run = function (result) {

       tw.locations().then( function(waters) { locations = waters;  } );

        var location = "tablerock";
        var url;
        var tailwaters = "";
        var type;
        var id;
        var generationData;
        var name;
        var state;
        var link = "http://khs-convo.herokuapp.com/api/public/tail";


        var sessionData = session.Get(result.phone);
    

        if (result.question[1] && result.question[1].toLowerCase() === "add" ) {

        
            return new Promise(function (resolve, reject) { return resolve("Added"); } );
        }
 
        var e = ""  
        for (var i = 1 ; i < result.question.length; i++) {
          e += result.question[i];         
        }


        var locationentry; 
  
        for (var i = 0; i < locations.length; i++) {

            if (locations[i].location.indexOf(e) >= 0 && e.length > 0) {
                location = locations[i].location;
                name = locations[i].name + " - "+ locations[i].state.toUpperCase();
                state = locations[i].state;
                id = locations[i].id;
                tailwaters += location + ",";
                type = locations[i].type;

                flowData =  locations[i].flowData;
            }

            tailwaters += locations[i].location + ",";

        }


        if (type) {

        

            if (type === "core") {

                url = "http://www.swl-wc.usace.army.mil/pages/data/tabular/htm/" + id;

                return lookup(location, name, url)
            }
            else {

                var date = new Date();
                var startDate = new Date();
                startDate.setDate( startDate.getDate() - 1 );
            
  
                var start =  startDate.getFullYear() + "-"  + (startDate.getMonth() + 1) + "-" + startDate.getDate();
                var end =  date.getFullYear() + "-"  + (date.getMonth() + 1) + "-" + date.getDate();

                if (flowData) {
                   url = "http://waterdata.usgs.gov/nwis/uv?cb_00060=on&cb_00065=on&format=rdb&site_no="+id+"&period=&begin_date="+start+"&end_date="+end;
                } else {
                  url = "http://waterdata.usgs.gov/nwis/uv?cb_00010=on&cb_00095=on&cb_00300=on&cb_62615=on&format=rdb&site_no="+id+"&period=&begin_date="+start+"&end_date="+end; 
                
                }

               
                return usgslookup(location, name, url);
            }


        }


        else {


           locations.sort(function(a, b) {

                    var x = a.state.toLowerCase()+a.location.toLowerCase();
                    var y = b.state.toLowerCase()+b.location.toLowerCase();
                    return x < y ? -1 : x > y ? 1 : 0;
                });

                var tailwaters= "";
                var state;
                for (var i = 0; i < locations.length; i++) {

                    if (locations[i].state != state) {
                        tailwaters += '\n'+locations[i].state.toUpperCase() + '\n';
                        state = locations[i].state;
                    }

                    tailwaters += locations[i].location+" | "; 
                }

    
             

            return new Promise(function (resolve, reject) { return resolve("Tailwater/Stream " + result.question[1] + " not found, here's a link of available water sites " + link) });
        }


    }

    events.push(event);

}


var lookup = function (location, name, url) {


    var bullshoals = "http://www.swl-wc.usace.army.mil/pages/data/tabular/htm/bulsdam.htm";
    var data;
    var byline = "by keyholesoftware.com \n";
        /*
    mongo.Get({Name: "byline"}, 'Content')
        .then(function (contact) {
            console.log(contact);
            byline = contact.Content;
        });
*/

    return new Promise(function (resolve, reject) {

        var info;
        var index = 13;
        var genapi = new Promise(function (resolve, reject) {

            request(url, function (error, response, body) {
                var bodyError = body ? body.indexOf('Error') > 0 : false;
                if (error || bodyError) {
                    return resolve("Site data currently unavailable.  Try again later.");
                }    
                var table = body.split('\n');
                if (table.length <= 1) {
                    return resolve("Site not found...");
                }
                var siphon = body.indexOf(' Siphon ') > 0; ;
                var spaces = "   ";
                var row;
                var loop = true;
                while (loop) {
                    row = table[table.length - index].replace(/    /g, ",");
                    row = row.replace(/,,/g, ",");
                 

                    if (row.split(',')[3].indexOf("-") < 0) {
                      
                        loop = false;
                    }

                    if (index < table.length) {
                        index++;
                    } else {
                        loop = false;
                    }
                }



                var cfs = siphon ? 5 : 4;
                var mhw = siphon ? 6 : 5;
                data = row.split(',').filter(function (n) { return n != '' });;
                info = "Current Generation: " + name + '\n';
                info += data[0].trim() + '\n';
                info += "Time " + data[1].trim() + '\n';
                info += "Elevation (ft-msl) " + data[2].trim() + '\n';
                info += "Tailwater (ft-msl) " + data[3].trim() + '\n';
                info += "Release (cfs) " + data[cfs].trim() + '\n';
                info += "Generation (mhw) " + data[mhw].trim() + '\n';
                info += "Corp Of Engineers data " + url + "\n";
                info += byline;



                return resolve(info);
            })
        });



        return resolve(genapi);

    })

}


var usgslookup = function (location,name,url) {

    var data;
    var byline = "by keyholesoftware.com \n";
        /*
    mongo.Get({Name: "byline"}, 'Content')
        .then(function (contact) {
            console.log(contact);
            byline = contact.Content;
        });
*/

    return new Promise(function (resolve, reject) {

        var info;
        var index = 2;
        var genapi = new Promise(function (resolve, reject) {

            request(url, function (error, response, body) {

                var table = body.split('\n');
                var spaces = "   ";
                var row;
                var loop = true;
                var ft = 4;
                var cfs = 6;
             
                // determine feet cfs order 
                for (var i = 0; i < table.length; i++ ) {

                         if (table[i].indexOf(" 00065 ") > 0) {
                               ft = 4;
                               cfs = 6;
                               break;
                         }        


                          if (table[i].indexOf(" 00060 ") > 0) {
                               ft = 6;
                               cfs = 4;
                               break;
                         }         


                }


                row = table[table.length - index].replace(/    /g, ",");
    
                row = row.replace(/,,/g, ",");
                data = row.split('\t').filter(function (n) { return n != '' });;

                if (data.indexOf("No sites/data found") >= 0 || data.length < 2) { return resolve("Flow data not available for site, at this time, please try later..."); }
      

 
                // determine properties....
                if (body.indexOf( "00300") > 0) {

                info = "Current Generation: " + name + '\n';
                info += data[2].trim() + '\n';
                info += "Surface Elevation (ft) " + data[4].trim() + '\n';
                info += "Temperature " + data[6].trim() + "c " + (((parseFloat(data[6]) * 9) / 5 + 32 )).toFixed(2) + "f \n";
                info += "Dissolved Oxygen (mg/l) " + data[8].trim() + '\n';
                info += "USGS data " + url + "\n";
                info += byline;



                } else {


              


                info = "Current Generation: " + name + '\n';
                info += data[2].trim() + '\n';
                info += "Gage Height (ft) " + data[ft].trim() + '\n';
                info += "Discharge (cfs) " + data[cfs].trim() + '\n';
                info += "USGS data " + url + "\n";
                info += byline;

                }
            

                return resolve(info);
            })
        });



        return resolve(genapi);

    })

}








