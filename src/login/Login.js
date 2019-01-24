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
import ajax from '../util/ajax';
// import axios from 'axios';
import {
    Card,
    CardBody,
    CardTitle,
    Container,
    Button,
    Row,
    Col,
    Input,
    MDBIcon
} from 'mdbreact';
import { resetCredentials, setCredentials } from '../actions';
import { store } from '../configureStore';
import { connect } from 'react-redux';
import { pathDefaultContent, serverLocal,  serverPort } from '../constants';


class Login extends Component {

    constructor(props) {
        super(props);
        console.log("Login LOADED");
        store.dispatch(resetCredentials);

        this.state = {
            loginError: '',
            firstName: '',
            lastName: ''
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.redirectToContent = this.redirectToContent.bind(this);
    }

    handleInputChange(ev) {
        ev.preventDefault();
        const target = ev.target;
        this.setState({[target.name]: target.value});
        this.setState({error: ''});
    }

    redirectToContent(){
        this.props.history.push(pathDefaultContent);
        console.log(`this.props.history.push(${pathDefaultContent})`)
    }

    handleSubmit(ev) {
        ev.preventDefault();
        store.dispatch(resetCredentials());

        // const base = (window.location.hostname === serverLocal) ? `http://${serverLocal}:${serverPort}` : '';
        const base = `http://${window.location.hostname}:${serverPort}`;

        console.log('submit login');

        ajax({
            method: 'post',
            url: '/api/auth/login',
            baseURL: base,
            data: this.state

        }).then(res => {
            console.log(`post-login`, res.data);
            // TODO use Redux instead of HTML5 session
            window.sessionStorage.setItem('token', res.data.token);
            window.sessionStorage.setItem('firstName', res.data.FirstName);
            window.sessionStorage.setItem('lastName', res.data.LastName);
            window.sessionStorage.setItem('phone', res.data.Phone);
            window.sessionStorage.setItem('status', res.data.Status);
            window.sessionStorage.setItem('apitoken', res.data.apitoken);
            window.sessionStorage.setItem('slackchannel', res.data.slackchannel);

            // Local state in case of .. what ..?
            this.setState({
                loginError: '',
                firstName: res.data.FirstName,
                lastName: res.data.LastName
            });

            // Login? Login? We don't need no stinkin' Login .
            // Give a shout-out that we have an authenticated user who is ready to roll.
            const credentials = {
                apitoken: res.data.apitoken,
                token: res.data.token,
                firstName: res.data.FirstName,
                lastName: res.data.LastName,
                phone: res.data.Phone || '',
                status: res.data.Status,
                slackchannel: res.data.slackchannel
            };

            store.dispatch(setCredentials( credentials ));
            this.redirectToContent();


        }).catch(err => {
            store.dispatch(resetCredentials());
            this.setState({
                loginError: 'Username or password incorrect. Please try again.',
                firstName: '',
                lastName: ''
            });
        });

    }


    render() {

        const inputPadding = {padding: '0.5rem'};
        const cardLayout = {width: "26rem", padding: "3em"};

        return (
            <Container>
                <Row>
                    <Col/>
                    <Col>
                        <Card style={cardLayout}>
                            <CardBody>
                                <CardTitle>Login</CardTitle>

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
                                           icon={"unlock"}
                                           group
                                           style={inputPadding}
                                           value={this.state.password}
                                           onChange={this.handleInputChange} placeholder="password"/>

                                    <Button  size={"medium"} type={"submit"} value={"Login"}><MDBIcon icon={"sign-in"}/>&nbsp;Login</Button>

                                </form>

                                <div className={"login-error"}>{this.state.loginError}</div>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col/>
                </Row>
            </Container>
        )
    }

}


const mapStateToProps = state => ( { credentials: state.credentials } );
export default connect(mapStateToProps)(Login);

