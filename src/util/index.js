/*
 * Copyright (c) 2019 Keyhole Software LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import moment from "../convos/NotifyEmulator";

/**
 * Standard sort comparator.
 *
 * @param a
 * @param b
 * @returns {number}
 */
export const compare = (a, b) => {
    if (a.count < b.count)
        return 1;
    if (a.count > b.count)
        return -1;
    return 0;
};


/**
 * Civen an array, returns a new array containing only the truthy values
 * of the input array.
 *
 * @param anArray
 * @returns {Array}
 */
export const cleanArray = (anArray) => {
    const newArray = [];
    anArray.forEach( item => {
        if (item){
            newArray.push(item);
        }
    });
    return newArray;
};


/**
 * Generates and returns a random HTML color code;
 *
 * @returns {string}
 */
export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};


/**
 * Converts raw date to a formatted "schedule date"
 *
 * @param sd, a raw schedule date
 * @returns {string}, a formatted date string
 */
export const formatScheduleDate = (sd) => {
    return `${moment(sd).format('L')} @ ${moment(sd).format('LT')}`;
};
