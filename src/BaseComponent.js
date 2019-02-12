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


import {Component} from 'react';
import {checkCredentials} from "./common/checkCredentials";

// Private helper
const checkAuthentication = props => {
    if (!checkCredentials()) {
        const {history} = props;
        if (history) {
            history.replace({pathname: '/login'});
        }
        return false;
    }
    return true;
};

/**
 * Components that extend this class receive intercepted rouiting that
 * that provides a routing redirect to autenticaion component(s).
 *
 * Authentication components (e.g. Login) should not extend this blass.
 * That would cause a redirect to self.
 *
 * Lou Mauget, 2019-01-23
 */
class BaseComponent extends Component {

    //----------------- Inject authentication redirect  suite ----------

    // React override intercepts birth of a secure component
    componentWillMount() {
        return checkAuthentication(this.props);
    }


    // Another React override monitors nav of secure component
    componentWillReceiveProps(nextProps) {
        if (nextProps.location !== this.props.location) {
            checkAuthentication(nextProps);
        }
    }

    //----------------- End authentication redirect  suite -------------

}

export default BaseComponent;
