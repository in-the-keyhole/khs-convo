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
//import './App.css';
import {
    BrowserRouter,
    Switch,
    Route
} from 'react-router-dom'
import Admin from './admin/Admin.js';
import Analytics from './analytics/Analytics.js';
import ConverstationsList from './analytics/ConversationsList.js';
import GroupQuestions from './analytics/GroupQuestions.js';
import GroupPhone from './analytics/GroupPhone.js';
import Visitors from './analytics/Visitors.js';
import Emulator from './emulator/Emulator'
import Login from './login/Login.js';
import Registration from './login/Registration.js';
import Tailwater from './convos/Tailwater.js';
import NotificationGroups from './convos/NotificationGroups.js';
import Blacklist from './admin/Blacklist.js';
import Properties from './admin/Properties.js';
import Upload from './upload/Upload.js';

import {
    Navbar,
    NavbarBrand,
    NavbarNav,
    NavItem,
    NavLink,
    NavbarToggler,
    Collapse,
    FormInline,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "mdbreact";

import {
    Container,
    Row,
    Col,
    Button
} from 'mdbreact';


class App extends Component {

    state = {
        isOpen: false
    };

    toggleCollapse = this.setState({isOpen: !this.state.isOpen});

    logout() {
        window.sessionStorage.clear();
        window.location.assign('/login');
    }

    greeting() {
        var token = window.sessionStorage.getItem('token');
        var firstName = window.sessionStorage.getItem('firstName');
        var lastName = window.sessionStorage.getItem('lastName');

        if (token) {
            return <div className="logout">
                <i className="glyphicon glyphicon-user"/>
                <span> {firstName} {lastName} </span>
                <Button onClick={this.logout}>Logout</Button>
            </div>

        } else {
            return <Button href="/Login" className="login">Login</Button>
        }


    }

    render() {

        const Main = () => (
            <main>
                <Switch>
                    <Route exact path='/' component={Admin}/>
                    <Route path='/analytics/all' component={ConverstationsList}/>
                    <Route path='/analytics/groupquestion' component={GroupQuestions}/>
                    <Route path='/analytics/groupphone' component={GroupPhone}/>
                    <Route path='/analytics/visitors' component={Visitors}/>
                    <Route path='/analytics' component={Analytics}/>
                    <Route path='/emulator' component={Emulator}/>
                    <Route path='/upload' component={Upload}/>
                    <Route path='/convos/tailwater' component={Tailwater}/>
                    <Route path='/convos/notifications' component={NotificationGroups}/>
                    <Route path='/blacklist' component={Blacklist}/>
                    <Route path='/properties' component={Properties}/>
                    <Route path='/login' component={Login}/>
                    <Route path='/register' component={Registration}/>
                </Switch>
            </main>
        );

        return (
            <BrowserRouter>
                <section>
                    <Navbar expand={"md"}>
                        <NavbarBrand><a href="/">KHS&#123;Convo&#125;</a></NavbarBrand>
                        <NavbarToggler onClick={this.toggleCollapse}/>
                        {/*<Collapse id="navbarCollapse" isOpen={this.state.isOpen}>*/}
                        <NavbarNav>
                            <Dropdown eventKey={1} id="nav-dropdown-1">
                                <DropdownToggle nav caret>
                                    <div className="d-none d-md-inline">Admin</div>
                                </DropdownToggle>

                                <DropdownItem eventKey={1.1} href="/">Users</DropdownItem>
                                <DropdownItem eventKey={1.2} href="/blacklist">Blacklist</DropdownItem>
                                <DropdownItem eventKey={1.3} href="/properties">Properties</DropdownItem>
                            </Dropdown>

                            <Dropdown eventKey={2} id="nav-dropdown-2">
                                <DropdownToggle nav caret>
                                    <div className="d-none d-md-inline">Analytics</div>
                                </DropdownToggle>

                                <DropdownItem eventKey={2.1} href="/analytics/all">Search All</DropdownItem>
                                <DropdownItem eventKey={2.1} href="/analytics/groupquestion">Group By
                                    Question</DropdownItem>
                                <DropdownItem eventKey={2.1} href="/analytics/groupphone">Group By Phone
                                    Number</DropdownItem>
                                <DropdownItem eventKey={2.1} href="/analytics/visitors">Visitors</DropdownItem>
                            </Dropdown>

                            <Dropdown eventKey={4} id="nav-dropdown-3">
                                <DropdownToggle nav caret>
                                    <div className="d-none d-md-inline">Convos</div>
                                </DropdownToggle>

                                <DropdownItem eventKey={4.2}
                                              href="/convos/notifications">Notifications</DropdownItem>
                            </Dropdown>

                            <NavLink eventKey={3} to="/emulator">Emulator</NavLink>
                            <NavLink eventKey={5} to="/upload">Upload</NavLink>
                        </NavbarNav>
                        {this.greeting()}

                        {/*</Collapse>*/}
                    </Navbar>

                    <Container>
                        <Row>
                            <Col>
                                {Main()}
                            </Col>
                        </Row>
                    </Container>

                </section>
            </BrowserRouter>
        );
    }
}

export default App;
