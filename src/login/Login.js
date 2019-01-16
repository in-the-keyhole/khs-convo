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

import React, {Component} from 'react';
import axios from 'axios';
import {
    Container,
    Button,
    Row,
    Col,
    Input
} from 'mdbreact';

class Login extends Component {

    constructor(props) {
        super(props);
        // TODO use Redux
        this.state = {username: '', password: '', loginError: ''};
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

        const base = (window.location.hostname === 'localhost') ? 'http://localhost:3001' : '';

        console.log('submit login');

        // TODO using axios in UI to avoid redirect interceptor, but let's fool the interceptor instead
        axios({
            method: 'post',
            url: '/api/auth/login',
            baseURL: base,
            data: this.state

        }).then(res => {
            console.log(res.data);
            // TODO use Redux instead of HTML5 session
            window.sessionStorage.setItem('token', res.data.token);
            window.sessionStorage.setItem('firstName', res.data.FirstName);
            window.sessionStorage.setItem('lastName', res.data.LastName);
            window.sessionStorage.setItem('phone', res.data.Phone);
            window.sessionStorage.setItem('status', res.data.Status);
            window.sessionStorage.setItem('apitoken', res.data.apitoken);
            window.sessionStorage.setItem('slackchannel', res.data.slackchannel);
            window.location = ('/emulator');
        }).catch(err => {
            this.setState({loginError: 'Username or password incorrect. Please try again.'});
        });

        ev.preventDefault();
    }


    render() {
        const inputPadding = {padding: '0.5rem'};
        return (
            <Container>
                <div className={"w-100 p-3"}>
                    <Row>
                        <Col md={"12"}><h1>Login</h1></Col>
                    </Row>

                    <Row>
                        <Col md={"12"}>

                            <form onSubmit={this.handleSubmit}>

                                <Input name={"username"}
                                       id={"username"}
                                       label={"User name"}
                                       hint={"User name"}
                                       type={"text"}
                                       icon={"user"}
                                       group
                                       style={inputPadding}
                                       value={this.state.username}
                                       onChange={this.handleInputChange} placeholder="username"/>

                                <Input name={"password"}
                                       id={"password"}
                                       label={"Password"}
                                       hint={"Password"}
                                       type={"password"}
                                       icon={"lock"}
                                       group
                                       style={inputPadding}
                                       value={this.state.password}
                                       onChange={this.handleInputChange} placeholder="password"/>

                                <Button type={"submit"} value={"Login"}  color={"primary"}>Login</Button>
                            </form>

                            <div className="login-error">{this.state.loginError}</div>
                        </Col>
                    </Row>
                </div>
            </Container>
        )
    }

}

export default Login
