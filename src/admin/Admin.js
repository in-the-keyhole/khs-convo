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

//import AddUser from './AddUser.js';
//import UserList from './UserList';
import { Modal  } from 'react-bootstrap';        
import '../styles/data-table.css';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

class Admin extends Component {

    constructor(props) {
        super(props); 

        this.state = {
            users: [],
            registrationEmail: '',
            currentUser: '',
            errorMsg: ''
        }

        this.componentWillMount = this.componentWillMount.bind(this);
        this.addUser = this.addUser.bind(this);   
        this.deleteUser = this.deleteUser.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.userToolbar = this.userToolbar.bind(this);
    }

    addUser(event) {
        var add = {
            FirstName: this.state.FirstName,
            LastName: this.state.LastName,
            Phone: this.state.Phone,
            Email:this.state.Email,
            ConfirmEmail:this.state.ConfirmEmail,
            Status: this.state.Status,
            Name: this.state.FirstName + ' ' + this.state.LastName,
            basePath: window.location.origin
        }

        var self = this;
        ajax({ 
            method:'post',
            url:'/api/admin', 
            data: add
        }).then(function(res) {

            if (res.data!=null &&  res.data ==='The email address you have entered is already registered') {
                self.setState({
                    errorMsg: "The email address you have entered is already registered."
                })
            }
            else if (res.data!=null &&  res.data ==='your email addresses are not the same') {
                self.setState({
                    errorMsg: "your email addresses are not the same"
                })
            }
            else{
                self.setState({
                    errorMsg: ''
                })
                self.closeAddUserModal()
                self.fetchUsers();
            }


        }).catch(function(err){
            console.log(err)});
            event.preventDefault();
        }    

    
    fetchUsers(){
        var self = this;
        ajax({ 
            url:'/api/admin', 
            data: this.state
        }).then(function(res) {
            self.setState({ 
                users: res.data.sort(function(a,b){
                    return   (a.FirstName.toLowerCase() > b.FirstName.toLowerCase()) ? 1 : -1;
                }),
                FirstName: '',
                LastName: '',
                Phone: '',
                Email:'',
                ConfirmEmail:'',
                Status: 'active'
             });

        }).catch(function(err){console.log(err)});
    }

    componentWillMount() { this.fetchUsers(); }

    sendRegistrationEmail(user){
        var creds = {
            uuid: this.state.currentUser.uuid,
            RegistrationEmail: this.state.registrationEmail,
            basePath: window.location.origin
        }        

        var self = this;
        ajax({ 
            method:'post',
            url:'/api/admin/sendRegistrationEmail', 
            data: creds,
        }).then(function(res) {
            //self.fetchUsers();
            console.log(res);
            if (res){
                self.closeCredentialsModal();                
            }else{
                self.setState({ 
                    errorMsg: 'Please check email address'
                });
            }
        })
    }
        
    
    onAfterSaveCell(row, cellName, cellValue) {
        var update = {
            uuid: row.uuid,
            [cellName]: cellValue
        }

        ajax({ 
            method:'put',
            url:'../api/admin', 
            data: update,
        }).catch(function(err){console.log(err)});
    }

    deleteUser(){
        var user = this.state.currentUser;
        user.Status = 'removed';

        var self = this;
        ajax({ 
            method:'put',
            url:'/api/admin', 
            data: user
        }).then(function(res) {
            self.fetchUsers();
            self.closeDeleteModal();
        }).catch(function(err){console.log(err)});

    }

    handleInputChange(event) {
        const target = event.target;
        this.setState({
            [target.name]: target.value,
            errorMsg: ''
        });
    }

    openCredentialsModal(user){ this.setState( { 
        currentUser: user,
        credentialsModal: true
    })}
    
    closeCredentialsModal() {
        console.log('CCM');
        this.setState({
            currentUser: '',                
            credentialsModal: false
        });
    }

    openDeleteModal(user){ this.setState( { 
        currentUser: user,
        deleteModal: true
    })}
    
    closeDeleteModal(){ this.setState({ 
        currentUser: '',        
        deleteModal: false 
    })}

    openAddUserModal(){ this.setState( { addUserModal: true })  }

    closeAddUserModal(){ this.setState( 
        { 
            addUserModal: false ,
            FirstName: '',
            LastName: '',
            Phone: '',
            Email:'',
            ConfirmEmail:'',
            Status: 'active',
            errorMsg: ''
        
        }) }

    userToolbar(cell, row) {
        return (
                <div className="adminIcons">
                    <i title="credentials" className="glyphicon glyphicon-lock clickable"  onClick={() => this.openCredentialsModal(row)}  />
                    <i title="delete" className="glyphicon glyphicon-remove-sign text-danger clickable"  onClick={() => this.openDeleteModal(row)}  />
                </div>  
        )
    }


    render() {
        return (

            <div className="container">
                
                <div className="row">
                    <div className="col-md-12"><h1>Admin</h1></div>
                </div>     

                <div className="row">
                    <div className="col-md-2 ">              
                        <button className="btn btn-primary" onClick={() => this.openAddUserModal()}>Add User</button>                
                    </div>
                </div>        

                <Modal show={this.state.addUserModal} onHide={this.close}>
                    <Modal.Body>
                        <form className="form" onSubmit={this.addUser}>
                    
                            <div className="container">

                            <div className="row">
                            <div className="col-md-12">
                                     <p className="text-danger">{this.state.errorMsg}</p>
                            </div>
                            </div>
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <input 
                                                name="FirstName"
                                                id="FirstName" 
                                                className="form-control" 
                                                type="text" 
                                                required
                                                value={this.state.FirstName} 
                                                onChange={this.handleInputChange} 
                                                placeholder="First Name" />
                                        </div>
                    
                                        <div className="form-group">
                                            <input 
                                                name="LastName" 
                                                id="LastName" 
                                                className="form-control" 
                                                type="text" 
                                                required
                                                value={this.state.LastName} 
                                                onChange={this.handleInputChange} 
                                                placeholder="Last Name" />
                                        </div>
                    
                                        <div className="form-group">
                                            <input name="Phone" id="Phone" className="form-control" type="text" required value={this.state.Phone} onChange={this.handleInputChange} placeholder="Phone Number" />
                                        </div>
                                    </div>


                                    <div className="col-md-3"> 
 
                                        <div className="form-group">
                                            <input name="Email" id="Email" className="form-control" type="email" required value={this.state.Email} onChange={this.handleInputChange} placeholder="Email" />
                                        </div>

                                        <div className="form-group">
                                            <input name="ConfirmEmail" id="ConfirmEmail" className="form-control" type="email" required="required"   value={this.state.ConfirmEmail} onChange={this.handleInputChange} placeholder="Confirm Email" />
                                        </div>

                                        <div className="form-group">
                                            
                                            <div className="row"> 
                                                <div className="col-md-4">
                                                <label> <h5>User Type</h5></label>
                                                 </div>
                                                <div className="col-md-8"> 
                                                 
                                                    <select id="addStatus"    className="form-control" name="Status" value={this.state.Status} onChange={this.handleInputChange}>
                                                        <option   value="active">active</option>
                                                        <option   value="admin">admin</option>
                                                    </select> 
                                                </div> 
                                                
                                            </div>                         
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-1"> </div>
                                    <div className="col-md-2"> <input className="btn btn-primary" type="submit" value="Add User" />  </div>
                                    <div className="col-md-9"> <button className="btn btn-default" onClick={() => this.closeAddUserModal()}>Cancel</button> </div> 
                               </div>
                               </div>
                        </form>
                    </Modal.Body>
                </Modal>
                    
                <Modal show={this.state.credentialsModal} onHide={this.close}>
                    <Modal.Body>
                        <div className="form-group">
                            <input autoComplete="off" name="registrationEmail" id="registrationEmail" className="form-control" type="email" required="required" value={this.state.registrationEmail} onChange={this.handleInputChange} placeholder="Email" />
                        </div>
                        <div className="red">{this.state.errorMsg}</div>

                        <button className="btn btn-primary"  onClick={() => this.sendRegistrationEmail()} >Send Registration Email</button>
                        <button className="btn btn-default" onClick={() => this.closeCredentialsModal()}>cancel</button>                
                    </Modal.Body>
                </Modal>        

                <Modal show={this.state.deleteModal} onHide={this.close}>
                    <Modal.Body>
                        <div className="form-group">
                            <label>Are you sure you want to delete this?</label>
                        </div>
                        <div className="row">
                            <div className="col-md-3"> </div>
                            <div className="col-md-4"> <button className="btn btn-danger"  onClick={() => this.deleteUser()} >Delete</button> </div>
                            <div className="col-md-5"> <button className="btn btn-default" onClick={() => this.closeDeleteModal()}>Cancel</button>   </div>                 
                        </div> 
                    </Modal.Body>
                </Modal>

                <div className="col-md-12 list">
                    <div className="row">
                        <BootstrapTable 
                            data={ this.state.users } 
                            //insertRow={ true }
                            pagination
                            cellEdit={ {
                                mode: 'click',
                                blurToSave: true,
                                afterSaveCell: this.onAfterSaveCell
                            }}>
                            <TableHeaderColumn dataField='uuid' isKey hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn dataField='FirstName' dataSort={ true } filter={ { type: 'TextFilter' } }>First Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='LastName' dataSort={ true } filter={ { type: 'TextFilter'} }>Last Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='Phone' dataSort={ true } filter={ { type: 'TextFilter' } }>Phone</TableHeaderColumn>
                            <TableHeaderColumn width="120" dataField='Status' 
                                filter={ { type: 'TextFilter' } }
                                dataSort={ true } 
                                editable={ { type: 'select', options: { values: ['active','admin'] } } }
                                >Status</TableHeaderColumn>
                            <TableHeaderColumn width="300" dataField='Username' dataSort={ true } filter={ { type: 'TextFilter' } }>Username</TableHeaderColumn>
                            <TableHeaderColumn width="60" editable={ false } dataFormat={this.userToolbar}></TableHeaderColumn>
                                
                        </BootstrapTable>
                    </div>
                </div>                    
            </div>
        ) 
    }
}

export default Admin
