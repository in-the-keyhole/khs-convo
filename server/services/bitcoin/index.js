/*
Copyright 2018 Keyhole Software LLC

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
const axios = require('axios');

let get24HoursPrice = function () {

    return new Promise(function (resolve, reject) {
        axios
            .get('https://blockchain.info/q/24hrprice')
            .then(response => {
                return resolve(response.data);
            })
            .catch(error => {
                console.log(error);
                return  reject(error); 
            });
    })
}

let getMarketCap = function () {
    return new Promise(function (resolve, reject) {
        axios
            .get('https://blockchain.info/q/marketcap')
            .then(response => {
                return resolve(response.data);
            })
            .catch(error => {
                console.log(error);
                return  reject(error); 
            });
    })
}

let get24HoursTx = function () {
    return new Promise(function (resolve, reject) {
        axios
            .get('https://blockchain.info/q/24hrtransactioncount')
            .then(response => {
                return resolve(response.data);
            })
            .catch(error => {
                return  reject(error); 
            });
    })
}

let getBitCoinInfo = function () {
    return new Promise(function (resolve, reject) {

        Promise.all([get24HoursPrice(), getMarketCap(), get24HoursTx()])
            .then(function (results) {
                var bitcoin = "";
                bitcoin += 'Price USD: '  + "$" + results[0].toLocaleString() +"\n";
                bitcoin += 'Makt Cap: '  + "$"+ (Math.round(results[1]*100)/100).toLocaleString() +"\n";
                bitcoin += '# Tx in 24 Hours: '  + results[2].toLocaleString() +"\n";

                resolve(bitcoin);
            })
            .catch(function (error) {
                reject(error);
            });
    })
}

module.exports = {
    getBitCoinInfo: getBitCoinInfo
}
