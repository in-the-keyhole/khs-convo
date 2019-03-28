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


import { createReducer } from 'redux-starter-kit';
import { resetCredentials, setCredentials} from '../actions';

const noUser = {
    username: null,
    password: null,
    loginError: null,
    token: null,
    firstName: null,
    lastName: null,
    phone: null,
    status: null,
    apitoken: null,
    slackchannel: null
};


const credentials = createReducer(noUser, {
    [resetCredentials]: (state, action) => noUser,
    [setCredentials]:   (state = noUser, action) => action.payload
});


export default credentials;
