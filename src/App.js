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
import {BrowserRouter as Router} from 'react-router-dom';
import {
    Navbar,
    NavbarBrand,
    NavbarNav,
    NavItem,
    NavLink,
    NavbarToggler,
    Collapse,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Container,
    Row,
    Col,
    Button,
    MDBIcon
} from 'mdbreact';
import { /*setCredentials,*/ resetCredentials} from './actions';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            collapse: false,
        };
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        this.setState({collapse: !this.state.collapse});
    }


    logout() {

        resetCredentials();

        window.sessionStorage.clear();
        window.location.assign('/login');
    }


    greeting() {
        // TODO Use Redux for global state
        const token = window.sessionStorage.getItem('token');
        const firstName = window.sessionStorage.getItem('firstName');
        const lastName = window.sessionStorage.getItem('lastName');

        const logout = <span>
                <MDBIcon icon="user" />&nbsp;{firstName}&nbsp;{lastName}&nbsp;
                <Button size={"sm"} onClick={this.logout}><MDBIcon icon="lock" />&nbsp;Logout</Button>
            </span>;

        const login = <Button size={"sm"} href="/Login"><MDBIcon icon="unlock" />&nbsp;Login</Button>;

        return token ? logout : login;
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
            <section>
                <Router>
                    <header>
                        {/*<Navbar expand="md" scrolling fixed="top">*/}
                        <Navbar expand="md">
                            <NavbarBrand><a href="/">KHS&#123;Convo&#125;</a></NavbarBrand>
                            <NavbarToggler onClick={this.onClick}/>

                            <Collapse isOpen={this.state.collapse} navbar>

                                <NavbarNav left>
                                    <NavItem>
                                        <Dropdown eventkey={1} id="nav-dropdown-1">
                                            <DropdownToggle nav caret>
                                                <div className="d-none d-md-inline">Admin</div>
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem eventkey={1.1} href="/">Users</DropdownItem>
                                                <DropdownItem eventkey={1.2} href="/blacklist">Blacklist</DropdownItem>
                                                <DropdownItem eventkey={1.3}
                                                              href="/properties">Properties</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </NavItem>

                                    <NavItem>
                                        <Dropdown eventkey={2} id="nav-dropdown-2">
                                            <DropdownToggle nav caret>
                                                <div className="d-none d-md-inline">Analytics</div>
                                            </DropdownToggle>

                                            <DropdownMenu>
                                                <DropdownItem eventkey={2.1} href="/analytics/all">Search
                                                    All</DropdownItem>
                                                <DropdownItem eventkey={2.1} href="/analytics/groupquestion">Group By
                                                    Question</DropdownItem>
                                                <DropdownItem eventkey={2.1} href="/analytics/groupphone">Group By Phone
                                                    Number</DropdownItem>
                                                <DropdownItem eventkey={2.1}
                                                              href="/analytics/visitors">Visitors</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </NavItem>

                                    <NavItem>
                                        <Dropdown eventkey={4} id="nav-dropdown-3">
                                            <DropdownToggle nav caret>
                                                <div className="d-none d-md-inline">Convos</div>
                                            </DropdownToggle>

                                            <DropdownMenu>
                                                <DropdownItem eventkey={4.2}
                                                              href="/convos/notifications">Notifications</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </NavItem>

                                    <NavItem active><NavLink eventkey={3} to="/emulator">Emulator</NavLink></NavItem>
                                    <NavItem active><NavLink eventkey={5} to="/upload">Upload</NavLink></NavItem>
                                </NavbarNav>

                            </Collapse>

                            {this.greeting()}

                        </Navbar>

                        <Container style={{marginTop: "1.75rem"}}>
                            <Row><Col>{Main()}</Col></Row>
                        </Container>

                    </header>
                </Router>
            </section>
        );
    }
}

export default App;
