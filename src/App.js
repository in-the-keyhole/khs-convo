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
  Nav, 
  NavItem, 
  NavDropdown,
  MenuItem,
  Button
} from 'react-bootstrap';


class App extends Component {

    logout(){
        window.sessionStorage.clear();
        window.location.assign('/login');
    }

    greeting(){
        var token = window.sessionStorage.getItem('token');
        var firstName = window.sessionStorage.getItem('firstName');
        var lastName = window.sessionStorage.getItem('lastName');

        if(token){
            return <div className="logout">
                        <i className="glyphicon glyphicon-user" />
                        <span > {firstName} {lastName} </span> 
                        <Button  onClick={ this.logout } >Logout</Button>
                    </div>
                    
        }else{
            return <Button  href="/Login" className="login">Login</Button>
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
     <div>
       <BrowserRouter>
         <div>
            <div>
            <Navbar>
                <Navbar.Header>
                <Navbar.Brand>
                    <a href="/">KHS&#123;Convo&#125;</a>
                </Navbar.Brand>
                </Navbar.Header>
                <Nav>
                    <NavDropdown eventKey={1} title="Admin" id="nav-dropdown">
                      <MenuItem eventKey={1.1} href="/">Users</MenuItem>
                      <MenuItem eventKey={1.2} href="/blacklist">Blacklist</MenuItem>
                      <MenuItem eventKey={1.3} href="/properties">Properties</MenuItem>
                    </NavDropdown>
                    <NavDropdown eventKey={2} title="Analytics" id="nav-dropdown">
                      <MenuItem eventKey={2.1} href="/analytics/all">Search All</MenuItem>
                      <MenuItem eventKey={2.1} href="/analytics/groupquestion">Group By Question</MenuItem>
                      <MenuItem eventKey={2.1} href="/analytics/groupphone">Group By Phone Number</MenuItem>
                      <MenuItem eventKey={2.1} href="/analytics/visitors">Visitors</MenuItem>
                    </NavDropdown>
                    <NavDropdown eventKey={4} title="Convos" id="nav-dropdown">
                      <MenuItem eventKey={4.2} href="/convos/notifications">Notifications</MenuItem>

                      
                    </NavDropdown>
                    <NavItem eventKey={3} href="/emulator">Emulator</NavItem>
                    <NavItem eventKey={5} href="/upload">Upload</NavItem>
                </Nav>
                {this.greeting()}
            </Navbar>
            </div>
            <div className="container">
              <div className="row">
               
                 <div>
                    <Main />
                  </div>
          
               </div>
              </div>
         </div>
       </BrowserRouter>  

     </div>  
    );
  }
}

export default App;
