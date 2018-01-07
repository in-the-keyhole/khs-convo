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
import _ from "lodash";
import ajax from '../util/ajax';
import NotifyEmulator from './NotifyEmulator';
import { Checkbox } from 'react-bootstrap';

class GroupUserList extends Component {
    constructor(props){
        super(props);

        this.state = {
            availableUsers: [],
            mailingList: this.props.group.Users,
            groupName: this.props.group.GroupName
        }
        
        this.componentWillMount = this.componentWillMount.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
        this.addUser = this.addUser.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    putGroup(group, reloadUsers) {
        if(reloadUsers === undefined) { reloadUsers = true; }

        var self = this;

        ajax({ 
            method:'put',
            url:'/api/notify/group', 
            data: group,
        }).then(function(res) {
            if(reloadUsers) {
                self.fetchUsers();
            } else {
                self.setState({});
            }
        }).catch(function(err){console.log(err)});
    }


    fetchUsers(){
        var self = this;
        ajax({ 
            url:'/api/admin', 
            data: this.state
        }).then(function(res) {
            self.setState({ 
                availableUsers: res.data
             });
        }).catch(function(err){console.log(err)});
    }


    addUser(event) {
        let selectedUser =  _.find(this.state.availableUsers, { 'uuid': event.target.value });
        let newUser = {
            uuid: selectedUser.uuid,
            Name: selectedUser.Name,
            Username: selectedUser.Username
        }
        let group = this.props.group
        group.Users.push(newUser);

        this.putGroup(group)
    }

    addAllUsers(event) {
        let group = this.props.group;
        group.Users = _.map(this.state.availableUsers, _.partialRight(_.pick, ['uuid', 'Name', 'Username']));
        
        this.putGroup(group)
    }

    deleteUser(userId) {
        let group = this.props.group;
        let list = group.Users;

        _.pullAllBy(list, [{ 'uuid': userId }], 'uuid');

        _.map(list, 'uuid');
        
        group.Users = list;

        this.putGroup(group)
    }


    componentWillMount() { 
        this.fetchUsers();
     }
     componentWillReceiveProps(){
         //console.log(this.props);
         this.setState(this.props);
     }

    handleChange(evt) {
        let group = this.props.group;
        group[evt.target.name] = evt.target.checked
        this.putGroup(group, false)
    }

    render() {

        if (!this.props.group.GroupName){return null;}
        
        
        const MailingList = this.props.group.Users.map((user) =>
            <li key={user.uuid} value={user.uuid}>
                {user.Name} - {user.Username}  <i title="delete" className="glyphicon glyphicon-remove-sign text-danger clickable"  onClick={() => this.deleteUser(user.uuid)}  />
            </li>
        );      

        const selectUsers = this.state.availableUsers.map((user) =>
            <option key={user.uuid} value={user.uuid}>{user.Name} - {user.Username}</option>
        );

        return (
            
            <div className="row">
                
                <h3>{this.props.group.GroupName} ({this.props.group.Users.length})</h3>
                <NotifyEmulator group={this.props.group}/>

                send to: 
                <Checkbox name="checkSMS" checked={this.props.group.checkSMS} onChange={this.handleChange}>SMS</Checkbox>
                <Checkbox name="checkEmail" checked={this.props.group.checkEmail} onChange={this.handleChange}>Email</Checkbox>
                <Checkbox name="checkSlack" checked={this.props.group.checkSlack} onChange={this.handleChange}>Slack</Checkbox>
                user: <select value={this.state.user} onChange={this.addUser}>
                    {selectUsers}
                </select>
                <button className="btn btn-default" onClick={() => this.addAllUsers()} >Add All</button>

                <ul>
                    {MailingList}
                </ul>
            </div>
        )
      }
}

export default GroupUserList
