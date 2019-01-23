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

import axios from 'axios';

const base = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

const ajax = axios.create({
    baseURL: base,
    headers: {"token": window.sessionStorage.getItem('token')}
});


ajax.interceptors.response.use(function (response) {
    // Do something with response data
    // console.log(response);
    return response;
}, function (error) {

    // No. This reloads the entire SPA bundle
    // if (error.response.status === 403) {
    //     window.location.assign('/login');
    // }

});

export default ajax
