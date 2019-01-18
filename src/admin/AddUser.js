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
import Admin from "./Admin"

class AddUser extends Component {

  constructor(props) {
    super(props);
    this.state = {FirstName: '',LastName: '',Phone: '', Name: ''};

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    console.log(Admin);
  }

  handleInputChange(event) {
    const target = event.target;
    this.setState({[target.name]: target.value});
  }

  handleSubmit(event) {
    console.log(this.state);
    event.preventDefault();
  }

  render() {
    return (
      <form className="form-inline" onSubmit={this.handleSubmit}>

        <div className="form-group">
            <input name="FirstName"id="FirstName" className="form-control" type="text" value={this.state.FirstName} onChange={this.handleInputChange} placeholder="First Name" />
        </div>

        <div className="form-group">
            <input name="LastName" id="LastName" className="form-control" type="text" value={this.state.LastName} onChange={this.handleInputChange} placeholder="Last Name" />
        </div>

        <div className="form-group">
            <input name="Phone" id="Phone" className="form-control" type="phone" value={this.state.Phone} onChange={this.handleInputChange} placeholder="Phone Number" />
        </div>

        <div className="form-group">
            <input name="Email" id="Email" className="form-control" type="email" value={this.state.Email} onChange={this.handleInputChange} placeholder="Email" />
        </div>
        <input className="btn btn-default" type="submit" value="Add User" />
      </form>
    );
  }
}


export default AddUser


