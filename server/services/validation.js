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

var ValidationUtils = {}

ValidationUtils.number = function (session, request, event, validator) {
   var n = request.question[0];
   if (isNaN(parseFloat(n))) { return "Number Please" }
   return undefined;
}

ValidationUtils.choice = function (session, request, event, validator) {
   var c = request.question[0].toLowerCase();
   var choices;
   try {
      choices = validator.split(':')[1].split(',');
   } catch(err) {
      return 'Choice vaidation ERROR, format should be choice:a,b,c,d';
   }

   if (!find(c, choices)) {
      return "Please enter one of these: " + choices + "\n or X to Cancel";
   }

   return undefined;
}

ValidationUtils.zip = function(c, choices) {
   var zips = ["66209", "66206", "66213", "66210", "66211", "64108", "64137"];
   var zip = request.question[0];
   if (zips.indexOf(zip) >= 0) { return undefined }
   return "Valid Zip Code Please " + zips.join(', ');
}

ValidationUtils.date = function (session, request, event, validator) {
   var dateInput = request.question[0];
   var dateChunks;
   if (dateInput.split('/').length == 3) {
      dateChunks = dateInput.split('/');
   } else if (dateInput.split('-').length == 3) {
      dateChunks = dateInput.split('-');
   } else {
      return "Valid date please \n - Follow one of these formats: 06/12/2004 or 06-15-2004";
   }
   var month = parseInt(dateChunks[0]);
   var day = parseInt(dateChunks[1]);
   var year = parseInt(dateChunks[2]);

   if (year < 1000 || year > 3000 || month === 0 || month > 12) { 
      return "Valid date please \n - Invalid month or year was provided";
   }

   var monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

   // Account for leap years
   if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
      monthLengths[1] = 29;
   }

   if (!(day > 0 && day <= monthLengths[month - 1])) {
      return "Valid date please \n - Invalid day was provided";
   }

   var dateFormat;
   if (validator.indexOf(':') !== -1) {
      try {
         var validOptions = ['past', 'future', 'today'];
         dateFormat = validator.split(':')[1];
         if (validOptions.indexOf(dateFormat) === -1) {
            throw "Invalid option err";
         }
      } catch(err) {
         return 'Date validation ERROR: Format should be date:future or date:past or date:today';
      }
   }

   if (dateFormat) {
      var validDate = new Date(dateInput).setHours(0, 0, 0, 0);
      var today = new Date().setHours(0, 0, 0, 0);
      switch (dateFormat) {
         case 'future':
            if (validDate <= today) {
               return "Valid date please \n Date must be in the future";
            }
            break;
         case 'past':
            if (validDate >= today) {
               return "Valid date please \n Date must be in the past";
            }
            break;
         case 'today':
            if (validDate !== today) {
               return "Valid date please \n Date must be today";
            }
            break;
      }
   }

   return undefined;
}


ValidationUtils.time = function (session, request, event, validator) {
   var time = request.question[0];
   var valid = /^[0-9]|0[0-9]|1[0-9]|2[0-3]:[0-5][0-9]$/.test(time);
   if (!valid) {
      return "Valid time please \n - Follow 24 hour format";
   }
   return undefined;
}

ValidationUtils.year = function (session, request, event, validator) {
   var yearInput = request.question[0];
   var formattedYear = parseInt(yearInput);
   if (isNaN(formattedYear) || formattedYear < 1000 || formattedYear > 3000) {
      return "Invalid year";
   }
   return undefined;
}

ValidationUtils.day = function (session, request, event, validator) {
   var dayInput = request.question[0];
   var formattedDay = parseInt(dayInput);
   if (isNaN(formattedDay) || formattedDay < 0 || formattedDay > 31) { return "Invalid day" }
   return undefined;
}

ValidationUtils.month = function (session, request, event, validator) {
   var monthInput = request.question[0];

   if (isNaN(parseInt(monthInput))) {
      var validMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 
         'september', 'october', 'november', 'december'];
      var month = monthInput.substring(0, 3);
      var validMonthInput = false;
      for (var i = 0; i < validMonths.length; i++) {
         if (month === validMonths[i].substring(0, 3)) {
            validMonthInput = true;
            break;
         }
      }
      if (!validMonthInput) return "Valid month please \n - Valid months: " + validMonths.join(', ');
   } else {
      var month = parseInt(monthInput);
      if (month < 1 || month > 12) { return "Valid month please \n - Valid month index: 1 - 12"}
   }

   return undefined;
}

ValidationUtils.dayOfWeek = function (session, request, event, validator) {
   var weekdayInput = request.question[0];

   if (isNaN(parseInt(weekdayInput))) {
      var validWeekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday',
         'saturday', 'sunday'];
      var weekday = weekdayInput.substring(0, 3);
      var validWeekdayInput = false;
      for (var i = 0; i < validWeekdays.length; i++) {
         if (weekday === validWeekdays[i].substring(0, 3)) {
            validWeekdayInput = true;
            break;
         }
      }
      if (!validWeekdayInput) {
         return "Valid day of the week please \n- Valid days of the week: " + validWeekdays.join(', ');
      }
   }

   return undefined;
}

ValidationUtils.email = function (session, request, event, validator) {
   var emailInput = request.rawQuestion;
   var validEmail = true;
   if (emailInput.indexOf('@') !== -1) {
      var domain = emailInput.split('@')[1];
      if (domain.indexOf('.') !== -1) {
         var ext = domain.split('.')[1];
         if (ext.length < 2 || ext.length > 4) {
            validEmail = false;
         }
      } else {
         validEmail = false;
      }
   } else {
      validEmail = false;
   }
   if (!validEmail) { return "Valid email please \n- Example: example@keyholesoftware.com" }

   return undefined;
}

// ------------------------
// ---- Helper Methods ----
// ------------------------
var find = function(c, choices) {
   for (var i = 0 ; i < choices.length; i++) {
      if (choices[i].toLowerCase() === c.toLowerCase()) { return true }
   }
   return false;
}

module.exports = ValidationUtils;
