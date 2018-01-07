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

import React, { Component } from 'react';
import ajax from '../util/ajax';
import '../styles/emulator.css';

class NotifyEmulator extends Component {

    constructor(props) {
        super(props);

        this.state = {
            msgtext: "",
            sentMsg: "",
            Body: "notify " + props.group.GroupName + " ",
            To: "9132703506",
            From:  window.sessionStorage.getItem('phone'),

        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);
        this.onConversationKeypress = this.onConversationKeypress.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        this.setState({
            [target.name]: target.value,
            sentMsg: ""
        });
    }


    onConversationKeypress(ev) {
        var key = ev.keyCode || ev.which;
        if (key === 13) { // enter key
            this.handleSubmit(ev);
        }
        return false;
    }

    handleSubmit(ev) {
        this.setState({  
            msgtext: "",
            sentMsg: "message sent"
        });

        var payload = {
            Body: "notify " + this.props.group.GroupName + ' ' + this.state.msgtext,
            From: this.state.From,
            To: this.state.To
        }


        var self = this;
        ajax({
            method:'POST',
            url:'/api/convo',
            data: payload
        }).then(function(res) {

            self.setState({  
                msgtext: "",
                sentMsg: "message sent"
            });
           // self.getConversationsForPhone();

        }).catch(function(err){console.log(err)});

        ev.preventDefault();
    }

    componentWillMount() {

    }
 

    render() {
        this.state.Body = "notify " + this.props.group.GroupName;

        return (
            <div className="container">

                <div className="row">
                    <div className="col-md-6">
                        <div className="emulator-container">
 
                            <div className="row">
                                <div className="col-md-10">
                                    <input name="msgtext" type="text" className="form-control emulator-input" autoFocus value={this.state.msgtext} onChange={this.handleInputChange} onKeyPress={this.onConversationKeypress} placeholder="Enter notification message here" />
                                </div>

                                <div className="col-md-2">
                                    <button className="btn btn-default" onClick={this.handleSubmit}>Send</button>
                                </div>

                            </div>
                            <div className="row">
                            <div className="col-md-10 red">{this.state.sentMsg}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default NotifyEmulator
