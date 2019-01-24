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
import * as _ from 'lodash';
import axios from 'axios';
import {serverPort} from "../constants";

class Registration extends Component {

    constructor(props) {
        super(props);
        this.state = {
            newPassword: '',
            repeatPassword: '',
            error: ''
        };

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value});
        this.setState({error: ''});
    }

    registerCreds(){

        const urlParams = _.chain(window.location.search)
            .replace('?', '') // a=b454&c=dhjjh&f=g6hksdfjlksd
            .split('&') // ["a=b454","c=dhjjh","f=g6hksdfjlksd"]
            .map(_.ary(_.partial(_.split, _, '='), 1)) // [["a","b454"],["c","dhjjh"],["f","g6hksdfjlksd"]]
            .fromPairs() // {"a":"b454","c":"dhjjh","f":"g6hksdfjlksd"}
            .value();

        console.log(urlParams);

        const creds = {
            uuid: urlParams.uuid,
            Username: urlParams.registrationEmail,
            Password: this.state.newPassword
        };

        console.log(creds);

        // var base = '';
        // if (window.location.hostname === 'localhost') {
        //     base = 'http://localhost:3001';
        // }
        const base = `http://${window.location.hostname}:${serverPort}`;


        axios({// using axios directly to avoid redirect interceptor
            method:'post',
            url:'/api/auth/register',
            baseURL: base,
            data: creds
        }).then(function(res) {
            window.location = ('/login');
        }).catch(function(err){
            //self.setState({loginError: 'Username or password incorrect. Please try again.'});
        });

    }

    checkPasswordMatch(){
        if (this.state.newPassword === this.state.repeatPassword){
            this.registerCreds();
        } else {
            this.setState({error: 'Passwords do not match'});
        }
    }

    render() {
        return (
            <div className="container">

                <div className="row">
                    <div className="col-md-12"><h1>Register</h1></div>
                </div>

                <div className="col-md-3">
                    <div className="red">{this.state.error}</div>

                    <label for="newPassword">Password</label>
                    <input autoComplete="off" name="newPassword" id="newPassword" className="form-control" type="password" required="required" value={this.state.newPassword} onChange={this.handleInputChange} placeholder="Password" />

                    <label for="repeatPassword">Repeat Password</label>
                    <input autoComplete="off" name="repeatPassword" id="repeatPassword" className="form-control" type="password" required="required" value={this.state.repeatPassword} onChange={this.handleInputChange} placeholder="Repeat Password" />


                    <button className="btn btn-primary" onClick={() => this.checkPasswordMatch()}>Register</button>
                </div>

            </div>
        );
    }

}

export default Registration;
