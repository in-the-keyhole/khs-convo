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
import superagent from 'superagent';
import Dropzone from 'react-dropzone';
import $ from 'jquery';
import '../styles/emulator.css';
import { confirmAlert } from 'react-confirm-alert';
import NotificationBar from '../common/NotificationBar';


class Upload extends Component {

    constructor(props) {
        super(props);

        this.state = {
            FromZip: "",
            FromState: "",
            FromCity: "",
            Body:"",
            FromCountry: "",
            To: "9132703506",
            From:  window.sessionStorage.getItem('phone'),
            Answer: "",
            Commands: "",
            CommandsCached: "",
            CachedCommands: "false",
            File: "",
            Status: window.sessionStorage.getItem('status'),
            Conversation: [],
            Directories: [],
            displayHover: "",
            DirectoriesAndWords: [],
            CurrentDirectory: "",
            DirectoryInputValue: ""
        }

        this.componentWillMount = this.componentWillMount.bind(this);
        this.uploadDroppedFile = this.uploadDroppedFile.bind(this);
        this.setDropDirectory = this.setDropDirectory.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.renderUploadFile = this.renderUploadFile.bind(this);
        this.updateInputValue = this.updateInputValue.bind(this);
        this.handleMouseIn = this.handleMouseIn.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.tooltipStyle = this.tooltipStyle.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value});
    }

    dynamicLinks(str) {
        if (typeof str !== 'string') { return str; }
        var listSpace = str.split(' ')
        listSpace.forEach(function(valSpace, iSpace) {
            if (valSpace.includes('http')){
                var listLine = valSpace.split('\n');
                listLine.forEach(function(valLine, iLine){
                    if (valLine.includes('http')){
                        listLine[iLine] = '<a target="_blank" href="' + valLine + '">' + valLine + '</a>';
                        listSpace[iSpace] = listLine.join('\n');
                    }
                });
            }
        });
        return listSpace.join(' ');
    }

    componentWillMount() {
        var self = this;

        var myData = {
            Body:"availablecommands",
            To: "+19132703506",
            From: window.sessionStorage.getItem('phone')
        };

        ajax({
            method:'POST',
            url:'/api/convo',
            data: myData
        }).then(function(res) {
            self.setState({
                Commands: self.dynamicLinks(res.data)
            });
            if (res.data.indexOf('Keyhole SMS commands') > -1 && self.state.CachedCommands === "false") {
                self.setState({
                    CommandsCached: self.dynamicLinks(res.data),
                    CachedCommands: "true"
                });
                console.log('It has been cached!!');
            }
            self.retrieveDirectories();
        }).catch(function(err){console.log(err)});
    }

    retrieveDirectories() {
        var self = this;
        ajax({
            url:'../api/admin/getDirectories',
            data: ''
        }).then(function(res, me) {
            var result = res.data;
            var directories = [];
            for(var i=0;i<result.length;i++) {
                directories.push(result[i].dataDirectory.currentDirectory);
            }

            var uniqueDirectories = directories.filter(function(elem, index, self) {
                return index === self.indexOf(elem);
            })

            self.setState({
                Directories: uniqueDirectories,
                DirectoriesAndWords: result
            });
        })
    }

    refreshAvailableCommandsList() {
        var self = this;

        var myData = {
            Body:"availablecommands",
            To: "+19132703506",
            From: window.sessionStorage.getItem('phone')
        };

        ajax({
            method:'POST',
            url:'/api/convo',
            data: myData
        }).then(function(res) {
            var commandText = self.getCommandUploaded(self.state.CommandsCached, self.dynamicLinks(res.data));
            var d = self.dynamicLinks(res.data);
            var UpdatedCommands = d.replace(commandText, '<b>' + commandText + '</b>')
            self.setState({ Commands: UpdatedCommands});
        }).catch(function(err){console.log(err)});
    }

    getCommandUploaded(a, b) {
        var i = 0;
        var j = 0;
        var result = "";

        while (j < b.length)
        {
            if (a[i] !== b[j] || i === a.length)
                result += b[j];
            else
                i++;
            j++;
        }
        return result;
    }

    uploadFile(e) {
         e.preventDefault();
         var self = this;

         let reader = new FileReader();
         let file = e.target.files[0];
         var fullPath = document.getElementById('upload').value;

         let originalName = fullPath.split(/(\\|\/)/g).pop();

         reader.onloadend = () => {
             let data = new FormData();
             data.append('file', file, originalName);

             ajax({
                  url:'../api/admin/fileExistsOnUpload?name=' + originalName + '&directory=' + self.state.CurrentDirectory,
                  data: originalName
             }).then(function(res, me) {
                  if (res.data === 'exists') {
                       self.renderConfirmDialog(data);
                  }  else {
                       self.proceedWithUpload(data);
                  }
             })
         }

         reader.readAsDataURL(file);
    }

    uploadDroppedFile(file) {
         var self = this;
         let data = new FormData();
         data.append('file', file[0]);
         data.append('override', 'true');

         ajax({
              method:'POST',
              url:'../api/admin/fileExistsOnUploadPost?directory=' + self.state.CurrentDirectory,
              data: data
         }).then(function(res, me) {
              if (res.data === 'exists') {
                   self.renderConfirmDialog(data);
              }  else {
                   self.proceedWithUpload(data);
              }
         })
    }

    proceedWithUpload(data) {
        var self = this;
        self.state.CommandsCached = self.state.Commands;
        let currentDirectory = self.state.CurrentDirectory;


        var base = window.location.hostname;
        if (window.location.hostname === 'localhost'){
            base = 'http://localhost:3001'
        }
        superagent
            .post(base+ '/api/admin/fileupload')
            .query({ directory: currentDirectory })
            .send(data)
            .end((ex, result) => {
                if (result.text === "File is uploaded") {
                    $('[name="' + currentDirectory + '"]').html('<p style="color: green;"><b>Event has been uploaded!<b></p>');
                    self.refreshAvailableCommandsList();
                    self.retrieveDirectories();
                } else {
                    $('[name="' + currentDirectory + '"]').html('<p style="color: red;"><b>' + result.text + '<b></p>');
                }
            });
    }

    initiateUploadClick(e) {
        var self = this;
        self.setState({ CurrentDirectory: e});
        var ele = $('#upload');
        ele.trigger('click');
    }

    setDropDirectory(e) {
        var self = this;
        self.setState({ CurrentDirectory: e});
    }

    handleMouseIn(x) {
        var self = this;
        self.setState({ displayHover: x });
        console.log("handleMouseIn The state " + JSON.stringify(self.state.displayHover));

    }

    handleMouseOut(x) {
        var self = this;
        self.setState({ displayHover: "" });
        console.log("handleMouseOut  The state " + JSON.stringify(self.state.displayHover));

    }
   
    
    tooltipStyle = function (x) {
        var self = this;
       return  { display: (x !== undefined && self.state.displayHover === x) ? 'block' : 'none' }
    }


    renderUploadFile() {
       var self = this;
        console.log("The self  state " +   JSON.stringify(self.state.displayHover) );
    
        var dropZoneStyle = {
            width: '250px',
            height: '35px',
            borderWidth: '1px',
            borderStyle: 'dashed',
            textAlign: 'center',
            marginBottom: '20px',
            //lineHeight: '7',
            verticalAlign: 'middle',
            display: 'table'
        }

        var directories = this.state.Directories;
        var directoriesAndWordsObj = this.state.DirectoriesAndWords;
        var directoryElements = [];
        var description="";
        var display;
        for (var i=0;i<directories.length;i++) {
            description="";
            display ="directory"+i;
            var words = [];
            for(var j=0;j<directoriesAndWordsObj.length;j++) {
           
                if (directories[i] === directoriesAndWordsObj[j].dataDirectory.currentDirectory) {
                    for(var k=0;k<directoriesAndWordsObj[j].dataDirectory.words.length;k++) {
                        words.push(directoriesAndWordsObj[j].dataDirectory.words[k])
                    }
                    if (description === "") {
                        description  =  directoriesAndWordsObj[j].description;
                    }else {
                        description =   description +",  " + directoriesAndWordsObj[j].description +" ";
                    }
                }
            
            }

            directoryElements.push(<div>
                <div className="row" >
                    <div className="col-md-2" >
                        <h5><b>{directories[i]}</b></h5>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-default" type="button" onClick={this.initiateUploadClick.bind(this, directories[i])}>Upload File</button>
                    </div>
                    <div className="col-md-3">
                        <Dropzone style={{ dropZoneStyle }} disableClick ={true} multiple={false} onDragOver={this.setDropDirectory.bind(this, directories[i])} onDrop={this.uploadDroppedFile}>
                            <div id="dropZoneText" name={directories[i]} style={ dropZoneStyle }>Drop file here</div>
                        </Dropzone>
                    </div>
                    <div className="col-md-5">
                        <div>
                        <p><b onMouseOver={this.handleMouseIn.bind(this,display)} onMouseOut={this.handleMouseOut.bind(this,display)}>Commands:</b> {words.map(t => <span>{t}</span>).reduce((prev, curr) => [prev, ', ', curr])}</p>
                            <div style= {this.tooltipStyle(display)}> {description}</div>
                        </div>
                    </div>
                </div>
  
                
                
            </div>);
        }

        if ( this.state.Status === 'admin' ) {
             return (<div>{directoryElements}</div>);
        } else {
            return <div></div>;
        }
    }

    updateInputValue(e) {
        this.setState({
            DirectoryInputValue: e.target.value
        });
    }

    renderConfirmDialog(data) {
        confirmAlert({
            title: 'Confirm to proceed',
            message: 'A convo event file with the same name already exists.  Are you sure you wish to proceed?',
            confirmLabel: 'Confirm',
            cancelLabel: 'Cancel',
            onConfirm: () => this.proceedWithUpload(data)
            //onCancel: () => do nothing,
        })
    }

    render() {

        var dropZoneStyle = {
            width: '250px',
            height: '30px',
            borderWidth: '1px',
            borderStyle: 'dashed',
            textAlign: 'center',
            marginBottom: '20px',
            //lineHeight: '7',
            verticalAlign: 'middle',
            display: 'table'
        }

        var directoryInputStyle = {
            width: '130px'
        }

        return (
            <div className="container">
                <NotificationBar />
                <div className="row">
                    <div className="col-md-12"><h1>Convo Event Upload</h1></div>
                </div>

                <form encType="multipart/form-data" action="">
                    <input type="file" name="fileName" defaultValue="fileName" id="upload" style={{display: 'none'}} onChange={this.uploadFile}/>
                </form>

                <div className="row">
                    <div className="col-md-12">
                        {this.renderUploadFile()}
                    </div>
                </div>
            </div>
        )
    }
}

export default Upload
