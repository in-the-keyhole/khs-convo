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

var StateMachine = require("../../services/state-machine");
var session = require("../../services/session");
var mongo = require("../../services/mongo");
var config = require('../../config');
var StateService = require('../../services/stateservice');
var pug = require('pug');


var host_url = config.url;

var uom = [
    { mabr: 'cm', abr: 'inch', e: 'Inches', m: 'Centimeters', value: 2.54, evalue: .39 },
    { mabr: 'm', abr: 'ft', e: 'Feet', m: 'Meters', value: .3, evalue: 3.3 },
    { mabr: 'm', abr: 'yd', e: 'Yards', m: 'Yards', value: .9, evalue: 1.1 },
    { mabr: 'km', abr: 'mi', e: 'Miles', m: 'Kilometers', value: 1.6, evalue: .6 },
    { mabr: 'cm2', abr: 'in2', e: 'Sq Inches', m: 'Sq Cm', value: 6.5, evalue: .2 },
    { mabr: 'm2', abr: 'ft2', e: 'Sq Feet', m: 'Sq Meters', value: .1, evalue: 10.8 },
    { mabr: 'm2', abr: 'yd2', e: 'Sq Yards', m: 'Sq Meters ', value: .8, evalue: 1.2 },
    { mabr: 'ha', abr: 'acres', e: 'Acres', m: 'Hectares', value: .4, evalue: 2.5 },
    { mabr: 'm3', abr: 'ft3', e: 'Cubic Feet', m: 'Cubic Mtrs', value: .03, evalue: 35.3 },
    { mabr: 'm3', abr: 'cd', e: 'Cords', m: 'Cubic Mtrs', value: 3.6, evalue: 1.1 },
    { mabr: 'l', abr: 'qt', e: 'Quarts', m: 'Liters', value: .9, evalue: 284.2 },
    { mabr: 'l',abr: 'gal', e: 'Gallons', m: 'Liters', value: 3.6, evalue: .04 },
    { mabr: 'g', abr: 'oz', e: 'Ounces', m: 'Grams', value: 28.4, evalue: .04 },
    { mabr: 'kg', abr: 'lb', e: 'Pounds', m: 'Kilograms', value: .5, evalue: 2.2 },
    { mabr: 'kw', abr: 'hp', e: 'Horsepower', m: 'Kilowatts', value: .7, evalue: 1.3 }
];


module.exports = function (events) {

    var event = {};

    event.states = [
        { reply: 'Number to Convert?', validator: 'number', desc: 'Number' },
        { reply: '(E)nglish or (M)etric?' , validator: 'choice:E,M', desc: 'Choose English or Metric' },
            { choices:[ { choice: 'e', reply: 'Unit of Measure in Metric Units? '+metricunits(), validator: validUom } ,
                        { choice: 'm', reply: 'Unit of Measure in English Units? '+units(), validator: validUom}] },
        { reply: convert } 
    ];
    
    event.isAuth = false;
    event.description = "Metric/English Conversion";
    event.words = [{
        word: 'metric',
        value: 10
    }, {
        word: 'english',
        value: 10
    }, {
        word: 'convert',
        value: 10
    }
    ]
    event.threash = 10;
    event.run = function (request) {
        return new Promise(function (resolve, reject) { 
            return resolve(StateService.doStates( event, request )); 
        });
    };

    events.push(event);
}

function generateConversion(session, phone, number, unit) {
    var compiledFunction="";
    var stream = "";
    var write = function (value) {
        stream = stream + value;
    };

    new Promise(function (resolve, reject, data) {

        mongo.Get({ phone: phone, state: 2 }, 'Sessions')
            .then(function (list) {
            
                compiledFunction = pug.compileFile(config.template_dir+  '/template/conversion-metric.pug');
                stream = compiledFunction({uom:uom});
                mongo.Update({ phone: phone }, { phone: phone, conversion: stream }, "Conversions", { upsert: true });
                session.Delete(phone);
                return;
            });
    });
};


function generateEnglishConversion(session, phone, number, unit) {
    var compiledFunction;
    var stream = "";
    var write = function (value) {
        stream = stream + value;
    };

    new Promise(function (resolve, reject, data) {

        mongo.Get({ phone: phone, state: 2 }, 'Sessions')
            .then(function (list) {

                compiledFunction = pug.compileFile(config.template_dir+ '/template/conversion-english.pug');
                stream = compiledFunction({uom:uom});
                mongo.Update({ phone: phone }, { phone: phone, conversion: stream }, "Conversions", { upsert: true })
                .then(function (response) {  
                })
                .catch(function (error) {
                    console.log(" Error in updated in Conversions " + error ) ; 
                });
                session.Delete(phone);
                return;
            });
    });
};




var getuom = function (u,unit) {

    var type = unit.toLowerCase();
    var list = type ===  'm' ? units() : metricunits();


    for (var i = 0; i < list.length; i++) {
       
        if (list[i] === u) {
            return uom[i];
        }

    }

    return null;

}

var convert = function (session, request, event, data) {


    var type = data[2].toLowerCase();
    var number = parseFloat(data[1]);
    var unit = getuom(data[3],type);


    if (type === "m") {
        generateConversion(session, request.phone, number, unit);
    }
    else {
        generateEnglishConversion(session, request.phone, number, unit);
    }


var link = host_url + "api/public/conversion/" + request.phone;
var answer = "\nlink to see all UNIT of MEASURE conversions \n " + link;

if (type === 'm') {
    var result = "" + number + " " + unit.e + " = " + (number * unit.value) + " " + unit.m + answer;
} else {
    var result = "" + number + " " + unit.m + " = " + (number * unit.evalue) + " " + unit.e + answer;
}

return result;                
    
} 

var metricunits = function () {

    var result = [];
    for (var i = 0; i < uom.length; i++) {
        result.push(uom[i].mabr);
    }
    return result;

};


var units = function () {

    var result = [];
    for (var i = 0; i < uom.length; i++) {
        result.push(uom[i].abr);
    }
    return result;

};

var validUom = function (session, request, event, data) {
    var uoms = data["2"].toLowerCase() === 'm' ? units() : metricunits();
    var m = request.question[0];
    if (uoms.indexOf(m) >= 0) {
        return undefined;
    }
    return "Valid UOM please " + uoms;
};


