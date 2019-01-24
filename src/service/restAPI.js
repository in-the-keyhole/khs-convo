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


// This is a vanilla NON-intercepted REST call
export const restLogin = axios.create({
    baseURL: base,
    headers: {"token": window.sessionStorage.getItem(pathLogin)}
});

export const restAPI = axios.create({
    baseURL: base,
    headers: {"token": window.sessionStorage.getItem(pathLogin)}
});


// This is an intercept-filtered REST call. It ignores HTTP status codes not listed in excludeStatus
const excludeStatus = new Set([403]);
restAPI.interceptors.response.use(response => {
    return response;
}, error => {

    if (!excludeStatus.has(error.response.status)) {
        // Warning: The following reloads the entire app - so .. flash, repaint
        window.location.assign(pathLogin);
    }

});

export default restAPI;
