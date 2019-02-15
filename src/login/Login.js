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
import {restLogin, setRestToken} from '../service/restAPI';
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
import {resetCredentials, setCredentials} from '../actions';
import {store} from '../configureStore';
import {connect} from 'react-redux';
import {pathDefaultContent} from '../constants';
import {base} from '../service/restHelpers';


class Login extends Component {

    constructor(props) {
        super(props);
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

    // Call this after a login success from server
    // Redirects to the default protected content
    redirectToContent() {
        this.props.history.push(pathDefaultContent);
    }

    handleSubmit(ev) {
        ev.preventDefault();
        store.dispatch(resetCredentials());
        setRestToken(null);

        restLogin({
            method: 'post',
            url: '/api/auth/login',
            baseURL: base,
            data: this.state

        }).then(res => {

            // Login? Login? We don't need no stinkin' Login.
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

            setRestToken(credentials.token);
            store.dispatch(setCredentials(credentials));
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

        const inputStyle = {padding: '0.5rem', color: "#000"};
        const cardLayout = {width: "26.0rem", padding: "3.0rem"};

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
                                           style={inputStyle}
                                           value={this.state.username}
                                           onChange={this.handleInputChange} placeholder="username"/>

                                    <Input name={"password"}
                                           id={"password"}
                                           label={"Password"}
                                           hint={"Password"}
                                           type={"password"}
                                           icon={"lock"}
                                           group
                                           style={inputStyle}
                                           value={this.state.password}
                                           onChange={this.handleInputChange} placeholder="password"/>

                                    <Button size={""}
                                            type={"submit"}
                                            color={"light"}
                                            value={"Login"}>
                                        <MDBIcon icon={"sign-in"}/>&nbsp;Login</Button>

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


const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(Login);

