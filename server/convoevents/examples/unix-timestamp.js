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
module.exports = function (events) {
   var event = {};
   event.isAuth = false;
   event.description = "Convert any date to Unix timestamp";
   event.words = [{
      word: 'timestamp',
      value: 10
   }];

   event.threash = 10;

   event.run = function (result) {
      return new Promise(function (resolve, reject) {

         var answer = "Timestamp (Now): " + new Date().getTime() + "\n- Example: timestamp 03/18/2015 or 03-18-2015";

         if (result.question.length > 1) {
            var date = result.question[1];

            var valid = validateDate(date);
            if (!valid) { return resolve('It seems like you entered an invalid date. Check and try again.') }

            var finalDate = new Date(date);
            answer = "Timestamp (" + finalDate.toDateString() + "): " + finalDate.getTime();
         }

         return resolve(answer);
      })
   }

   events.push(event);
}

function validateDate(date) {
   if (typeof(date) !== "string") return false;

   var dateChunks;
   if (date.split('/').length == 3) {
      dateChunks = date.split('/');
   } else if (date.split('-').length == 3) {
      dateChunks = date.split('-');
   } else {
      return "Valid date please \n - Follow one of these formats: 06/12/2004 or 06-15-2004";
   }
   var month = parseInt(dateChunks[0]);
   var day = parseInt(dateChunks[1]);
   var year = parseInt(dateChunks[2]);

   if (year < 1000 || year > 3000 || month == 0 || month > 12) { return false }

   var monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

   // Account for leap years
   if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
      monthLengths[1] = 29;
   }

   return (day > 0 && day <= monthLengths[month - 1]);
}
