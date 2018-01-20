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
import axios from 'axios';

class Login extends Component {

    constructor(props) {

        super(props); 
        this.state = { username: '', password: '', loginError: '' };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);        
    }

    handleInputChange(ev) {
        const target = ev.target;
        this.setState({[target.name]: target.value});
        this.setState({error: ''});
    }

    handleSubmit(ev) {
        console.log(this.state);

        var base = '';
        if (window.location.hostname === 'localhost') {
            base = 'http://localhost:3001';
        }

        console.log('submit login');
        var self = this;
        axios({// using axios directly to avoid redirect interceptor
            method:'post',
            url:'/api/auth/login',
            baseURL: base,
            data: this.state
        }).then(function(res) {
            console.log(res.data);
            window.sessionStorage.setItem('token', res.data.token);
            window.sessionStorage.setItem('firstName', res.data.FirstName);
            window.sessionStorage.setItem('lastName', res.data.LastName);
            window.sessionStorage.setItem('phone', res.data.Phone);
            window.sessionStorage.setItem('status', res.data.Status);
            window.location = ('/emulator');
        }).catch(function(err){
            self.setState({loginError: 'Username or password incorrect. Please try again.'});
        });

        ev.preventDefault();
    }    

        
    render() {
        return (

            <div className="container">
                <div className="row">
                    <div className="col-md-12"><h1>Login</h1></div>
                </div>        

                <div className="row">
                    <div className="col-md-4 col-md-offset-4">

                        <form className="form" onSubmit={this.handleSubmit}>

                            <div className="form-group">
                                <label>Username:</label>
                                <input name="username" id="username" className="form-control" type="text" value={this.state.username} onChange={this.handleInputChange} placeholder="username" />
                            </div>

                            <div className="form-group">
                                <label>Password:</label>
                                <input name="password" id="password" className="form-control" type="password" value={this.state.password} onChange={this.handleInputChange} placeholder="password" />
                            </div>

                            <input className="btn btn-default" type="submit" value="Login" />
                        </form>

                        <div className="login-error">{this.state.loginError}</div>
                    </div>
                </div>
            </div>
        ) 
    }

}

export default Login
