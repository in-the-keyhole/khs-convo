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

import axios from 'axios';
import {pathLogin} from '../constants';
import {base} from './restHelpers';

// A vanilla NON-intercepted REST call having no token header. Used for public api calls.
export const restLogin = axios.create({
    baseURL: base
});


// An intercept-filtered REST call. It ignores HTTP status codes not listed in ignoreStatus (eg 403 - not auth)
export const restAPI = axios.create({
    baseURL: base,
    headers: {'token': null}
});


// After authentication, Login component would invoke this function to set the token into the restAPI
export const setRestToken = tok => restAPI.defaults.headers = {'token': tok};

const ignoreStatus = new Set([403]);

restAPI.interceptors.response.use(response => {
    return response;
}, error => {

    if (!ignoreStatus.has(error.response.status)) {
        // Warning: The following reloads the entire app - so .. flash, repaint
        window.location.assign(pathLogin);
    }

});

export default restAPI;
