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

import React from 'react';
import restAPI from '../service/restAPI';
import BaseComponent from '../BaseComponent';
import {connect} from "react-redux";

class NotificationBar extends BaseComponent {

    constructor(props) {
        super(props);
        console.log('NotificationBar', props.credentials);

        this.state = {
            duplicates: []
        };

        restAPI({
            method:'GET',
            url:'/api/convo/duplicates'
        }).then( res => {
            this.setState({
                duplicates: res.data
            })
        }).catch( err => console.log(err) );
    }

    render() {

        const Notifications = this.state.duplicates.map(dupe =>
            <div className="alert alert-warning">
                Warning: Duplicate convo event for the word <strong>&#39;{dupe.term}&#39; </strong> found
                in <strong>{dupe.filenames}</strong>
            </div>
        );

        return (
            <div>
                {Notifications}
            </div>
        )
    }
}

const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(NotificationBar);
