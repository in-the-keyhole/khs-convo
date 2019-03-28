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

module.exports = function (events) {

    const event = {};
    event.isAuth = false;
    event.description = "Tip Calculator";
    event.words = [{
        word: 'tip',
        value: 10
    },
    {
        word: 'tips',
        value: 10
    }];

    event.threash = 10;
    event.run = function (result) {

        let tips = "Bill Amount Please, example... \n tip 100.00";

        // noinspection ES6ModulesDependencies
        return new Promise(function (resolve) {
            let decimal = ".00";
            if (result.question.length > 1) {

                if (result.question[1] > 2  ) {
                      decimal = "."+result.question[2];
                }

                const amount = parseFloat(result.question[1] + decimal);

                if (!amount) {
                    tips = "Use a number please, example...\ tip 100.00";
                } else {
                    const fifteen = amount * 0.15;
                    const twenty = amount * 0.20;
                    const twentyfive = amount * 0.25;

                    tips = `15% = ${fifteen.toFixed(2)} ($${(amount + fifteen).toFixed(2)})`;
                    tips += ` 20% = ${twenty.toFixed(2)} ($${(amount + twenty).toFixed(2)})`;
                    tips += ` 25% = ${twentyfive.toFixed(2)} ($${(amount + twentyfive).toFixed(2)})`;
                }

            }

            return resolve(tips);

        })
    };

    events.push(event);

};
