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
import ajax from '../util/ajax';

import { Modal  } from 'react-bootstrap';        
import '../styles/data-table.css';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import GroupUserList from './GroupUserList';


class NotificationGroups extends Component {

    constructor(props) {
        super(props); 

        this.state = {
            users: [],
            GroupName: '',
            group: '',
            currentGroup: {
                GroupName: '',
                users: []
            },
            showUserList: false

        }

        this.componentWillMount = this.componentWillMount.bind(this);
        this.addGroup = this.addGroup.bind(this);   
        this.handleInputChange = this.handleInputChange.bind(this);
        this.groupToolbar = this.groupToolbar.bind(this);
        //this.deleteUser = this.deleteUser.bind(this);
        
    }

    addGroup(event) {

        var add = {
            GroupName: this.state.GroupName,
            checkSMS: true,
            checkEmail: false,
            checkSlack: false,
            Users: [],

        }

        var self = this;
        ajax({ 
            method:'post',
            url:'/api/notify/group', 
            data: add
        }).then(function(res) {

            self.showGroupUsers(res.data)
            self.closeAddGroupModal();
            self.fetchGroups();

            
        }).catch(function(err){console.log(err)});

        event.preventDefault();
    }    
    
    fetchGroups(){
        var self = this;
        ajax({ 
            method: 'get',
            url:'/api/notify/group', 
            data: this.state
        }).then(function(res) {

            self.setState({ 
                users: res.data,
             });

        }).catch(function(err){console.log(err)});
    }

    onAfterSaveGroup(row, cellName, cellValue) {

        var update = {
            uuid: row.uuid,
            [cellName]: cellValue
        }
        var self = this;
        ajax({ 
            method:'put',
            url:'/api/notify/group', 
            data: update,
        }).then(function(res) {
            
            self.fetchGroups();
        }).catch(function(err){console.log(err)});
    }

    deleteGroup(){

        console.log(this.state.currentGroup);
        var self = this;

        ajax({ 
            method: 'delete',
            url:'/api/notify/group', 
            data: this.state.currentGroup
        }).then(function(res) {

            self.showGroupUsers({GroupName: ''});
            self.closeDeleteModal();
            self.fetchGroups();

        }).catch(function(err){console.log(err)});
        
    }   



    componentWillMount() { this.fetchGroups(); }
        

    handleInputChange(event) {
        const target = event.target;
        this.setState({
            [target.name]: target.value,
            errorMsg: ''
        });
    }

    showGroupUsers(row){
        //console.log(row);
        this.setState({
            currentGroup: row,
            showUserList: true,
            group: 'User list for ' + row.GroupName

        });
    }
    openDeleteModal(group){ this.setState( { 
        currentGroup: group,
        deleteModal: true
    })}
    
    closeDeleteModal(){ this.setState({     
        deleteModal: false 
    })}

    openAddGroupModal(){ this.setState( { addGroupModal: true })  }

    closeAddGroupModal(){ this.setState( { addGroupModal: false }) }

    groupToolbar(cell, row) {
        return (
                <div className="adminIcons">
                    <i title="View Group" className="glyphicon glyphicon-user clickable"  onClick={() => this.showGroupUsers(row)}  />
                    <i title="Delete Group" className="glyphicon glyphicon-remove-sign text-danger clickable"  onClick={() => this.openDeleteModal(row)}  />
                </div>  
        )
    }

    groupUsers(cell, row) {
        return (
            <div className="groupListUserCount">{row.Users.length}</div>  
        )
    }
    

    render() {

        return (

            <div className="container">
                
                <div className="row">
                    <div className="col-md-12"><h1>Groups</h1></div>
                </div>     

                <div className="row">
                    <div className="col-md-2 ">              
                        <button className="btn btn-primary" onClick={() => this.openAddGroupModal()}>Add Group</button>                
                    </div>
                </div>        

                    

                <Modal show={this.state.addGroupModal} onHide={this.close}>
                    <Modal.Body>
                        <form className="form" onSubmit={this.addGroup}>
                    
                            <div className="container">
                                <div className="row">
                                
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <input 
                                                name="GroupName"
                                                id="GroupName" 
                                                className="form-control" 
                                                type="text" 
                                                required="required"
                                                value={this.state.GroupName} 
                                                onChange={this.handleInputChange} 
                                                placeholder="Group Name" />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">     
                                    <div className="col-md-12">         
                                        <input className="btn btn-primary" type="submit" value="Add Group" />
                                        <button className="btn btn-default" onClick={() => this.closeAddGroupModal()}>Cancel</button>                
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>

                <Modal show={this.state.deleteModal} onHide={this.close}>
                    <Modal.Body>
                        <div className="form-group">
                            <label>Are you sure you want to delete this?</label>
                        </div>
                        <div className="row">
                            <div className="col-md-3"> </div>
                            <div className="col-md-4"> <button className="btn btn-danger"  onClick={() => this.deleteGroup()} >Delete</button> </div>
                            <div className="col-md-5">  <button className="btn btn-default" onClick={() => this.closeDeleteModal()}>Cancel</button> </div>                 
                        </div> 
                    </Modal.Body>
                </Modal>

                <div className="row">
                    <div className="col-md-3 list">
                        <div className="row">
                            <BootstrapTable 
                                data={ this.state.users } 
                                //insertRow={ true }
                                
                                cellEdit={ {
                                    mode: 'click',
                                    blurToSave: true,
                                    afterSaveCell: this.onAfterSaveGroup
                                }}>
                                <TableHeaderColumn dataField='uuid' isKey hidden>ID</TableHeaderColumn>
                                <TableHeaderColumn dataField='GroupName' >Group Name</TableHeaderColumn>

                                <TableHeaderColumn  className="groupListUserCount" dataField='Users' editable={ false } dataFormat={this.groupUsers} ># Users</TableHeaderColumn>

                                <TableHeaderColumn width="60" editable={ false } dataFormat={this.groupToolbar}></TableHeaderColumn>
                                    
                            </BootstrapTable>
                        </div>
                    </div>      

                    

                    <div className="col-md-8 col-md-offset-1">
                        <GroupUserList group={this.state.currentGroup}  />
                    </div>
                </div>
            </div>
                ) 
    }
}

export default NotificationGroups
