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
import {
    Switch,
    Route,
    Link,
    withRouter
} from 'react-router-dom'
import Admin from './admin/Admin';
import Analytics from './analytics/Analytics';
import ConversionListChunked from './analytics/ConversationsList';
import GroupQuestions from './analytics/GroupQuestions';
import GroupPhone from './analytics/GroupPhone';
import Visitors from './analytics/Visitors';
import Emulator from './emulator/Emulator'
import Login from './login/Login';
import Registration from './login/Registration';
import Tailwater from './convos/Tailwater';
import NotificationGroups from './convos/NotificationGroups';
import Blacklist from './admin/Blacklist';
import Properties from './admin/Properties';
import Upload from './upload/Upload';
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
import {resetCredentials} from './actions';
import {store} from './configureStore';
import {checkCredentials} from './common/checkCredentials';
import { connect } from 'react-redux';

class App extends Component {

    constructor(props) {
        super(props);
        console.log('App props', props);

        this.state = {
            collapse: false,
            hasError: false
        };

        this.onClick = this.onClick.bind(this);
        this.onClickLogout = this.onClickLogout.bind(this);
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.log(error, info);
    }

    onClick(ev) {
        ev.preventDefault();
        this.setState({collapse: !this.state.collapse});
    }

    onClickLogout(ev) {
        ev.preventDefault();
        store.dispatch(resetCredentials());

        const path = '/login';
        this.props.history.push(path);
        console.log(`this.props.history.push(${path})`)
    }


    getLogoutFragment() {
        //  Sent-via Redux props.credentials
        const token = this.props.credentials.token;
        const firstName = this.props.credentials.firstName;
        const lastName = this.props.credentials.lastName;

        const logout = (

            <span>
                <MDBIcon icon="user"/>&nbsp;{firstName}&nbsp;{lastName}&nbsp;
                <Button size={"sm"} color={"light"} onClick={this.onClickLogout}><MDBIcon icon="sign-out"/>&nbsp;Logout</Button>
            </span>
        );

        return token ? logout : '';
    }


    render() {

        // BrowserRouter's route switch:
        const main = (
            <main>
                <Switch>
                    <Route exact path='/' component={Admin}/>
                    <Route path='/analytics/all' component={ConversionListChunked}/>
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

        // Show most of the navbar only for authenticated users
        const privateNav = checkCredentials() ?
            (
                <Collapse isOpen={this.state.collapse} navbar>

                    <NavbarNav left>
                        <NavItem>
                            <Dropdown eventkey={1} id="nav-dropdown-1">
                                <DropdownToggle nav caret>
                                    <div className="d-none d-md-inline">Admin</div>
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem eventkey={1.1}><Link to={"/"}>Users</Link></DropdownItem>
                                    <DropdownItem eventkey={1.2}><Link to={"/blacklist"}>Blacklist</Link></DropdownItem>
                                    <DropdownItem eventkey={1.3}><Link
                                        to={"/properties"}>Properties</Link></DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </NavItem>

                        <NavItem>
                            <Dropdown eventkey={2} id="nav-dropdown-2">
                                <DropdownToggle nav caret>
                                    <div className="d-none d-md-inline">Analytics</div>
                                </DropdownToggle>

                                <DropdownMenu>
                                    <DropdownItem eventkey={2.1}><Link to={"/analytics/all"}>Search
                                        All</Link></DropdownItem>
                                    <DropdownItem eventkey={2.1}><Link to={"/analytics/groupquestion"}>Group By
                                        Question</Link></DropdownItem>
                                    <DropdownItem eventkey={2.1}><Link to={"/analytics/groupphone"}>Group By Phone
                                        Number</Link></DropdownItem>
                                    <DropdownItem eventkey={2.1}><Link
                                        to={"/analytics/visitors"}>Visitors</Link></DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </NavItem>

                        <NavItem>
                            <Dropdown eventkey={4} id="nav-dropdown-3">
                                <DropdownToggle nav caret>
                                    <div className="d-none d-md-inline">Convos</div>
                                </DropdownToggle>

                                <DropdownMenu>
                                    <DropdownItem eventkey={4.2}><Link to={"/convos/notifications"}>Notifications</Link></DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </NavItem>

                        <NavItem active><NavLink eventkey={3} to="/emulator">Emulator</NavLink></NavItem>
                        <NavItem active><NavLink eventkey={5} to="/upload">Upload</NavLink></NavItem>

                    </NavbarNav>

                    {/* User name and logout button : pull right */}
                    <NavbarNav right>
                        <NavItem>
                            {this.getLogoutFragment()}
                        </NavItem>
                    </NavbarNav>

                </Collapse>
            ) : (<span/>);

        if (this.state.hasError) {
            return <h1>Something is wrong in the view.</h1>;
        }

        return (
            <header>
                {/*<Navbar expand="md" scrolling fixed="top">*/}
                <Navbar expand="md">
                    <NavbarBrand><Link to={"/"}>KHS&#123;Convo&#125;</Link></NavbarBrand>
                    <NavbarToggler onClick={this.onClick}/>
                    {privateNav}
                </Navbar>

                {/*This is the working content panel. The rest is really header / nabvar.*/}
                <Container style={{marginTop: "1.75rem"}}>
                    <Row><Col>{main}</Col></Row>
                </Container>

            </header>
        );
    }
}


const mapStateToProps = state => ({credentials: state.credentials});

export default withRouter(connect(mapStateToProps)(App));
