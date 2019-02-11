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

import "font-awesome/css/font-awesome.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";
import './styles/index.css';
import './styles/data-table.css';
import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom'
import App from './App';
import {Footer, FooterPanel} from './footer';
import {Provider} from 'react-redux';
import {store} from './configureStore';
import ConvoNotificationContainer from './common/ConvoNotificationContainer';

const element = (
    <Fragment>
        <BrowserRouter id="wrapper">
            <Provider store={store}>
                {/*<div id="header"></div>*/}
                <div id="content"><App/></div>
                <div id="footer"><FooterPanel/></div>
            </Provider>
        </BrowserRouter>
        <ConvoNotificationContainer/>
    </Fragment>
);

ReactDOM.render(
    element,
    document.getElementById('root')
);
