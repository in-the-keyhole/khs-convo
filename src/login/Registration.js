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
import * as _ from 'lodash';
import {restLogin} from '../service/restAPI';
import {base} from '../service/restHelpers';
// noinspection ES6CheckImport
import {
    Container,
    Button,
    Row,
    Col,
    Input,
    toast,
    Card,
    CardBody,
    CardTitle,
    MDBIcon
} from 'mdbreact';


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
        this.setState({[target.name]: target.value, error: ''});
    }


    registerCreds() {

        const urlParams = _.chain(window.location.search)
            .replace('?', '') // a=b454&c=dhjjh&f=g6hksdfjlksd
            .split('&') // ["a=b454","c=dhjjh","f=g6hksdfjlksd"]
            .map(_.ary(_.partial(_.split, _, '='), 1)) // [["a","b454"],["c","dhjjh"],["f","g6hksdfjlksd"]]
            .fromPairs() // {"a":"b454","c":"dhjjh","f":"g6hksdfjlksd"}
            .value();

        const creds = {
            uuid: urlParams.uuid,
            Username: urlParams.registrationEmail,
            Password: this.state.newPassword
        };

        restLogin({
            method: 'post',
            url: '/api/auth/register',
            baseURL: base,
            data: creds
        }).then(() => {
            // location re-init the app - a screen flash - all other routes should use a react-route within the SPA
            window.location = ('/login');
        }).catch(err =>
            //self.setState({loginError: 'Username or password incorrect. Please try again.'});
            console.log(`Registration API issue`, err)
        );

    }


    checkPasswordMatch() {
        if (this.state.newPassword === this.state.repeatPassword) {
            this.registerCreds();
        } else {
            const noMatch = 'Passwords do not match';
            this.setState({error: noMatch});
            toast.warning(noMatch);
        }
    }


    render() {
        const inputStyle = {padding: '0.5rem', color: "#000"};
        const cardLayout = {width: "26.0rem", padding: "3.0rem", height: "20rem"};

        return (
            <Container>
                <Row>
                    <Col/>
                    <Col>
                        <Card style={cardLayout}>
                            <CardBody>
                                <CardTitle>Password Registration</CardTitle>

                                <form onSubmit={this.handleSubmit}>

                                    <Input name={"password"}
                                           id={"password"}
                                           label={"Password"}
                                           type={"password"}
                                           icon={"lock"}
                                           style={inputStyle}
                                           value={this.state.password}
                                           onChange={this.handleInputChange}
                                    />

                                    <Input name={"repeatPassword"}
                                           id={"repeatPassword"}
                                           label={"Repeat Password"}
                                           type={"password"}
                                           icon={"lock"}
                                           style={inputStyle}
                                           value={this.state.repeatPassword}
                                           onChange={this.handleInputChange}
                                    />

                                    <Button size={""}
                                            type={"submit"}
                                            color={"light"}
                                            value={"register"}>
                                        <MDBIcon icon="user"/>&nbsp;Register</Button>

                                </form>

                            </CardBody>
                        </Card>
                    </Col>
                    <Col/>
                </Row>
            </Container>

        );
    }

}

export default Registration;
