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

import React from 'react';
import ajax from '../util/ajax';
import { RadialBarChart, RadialBar, Legend, Tooltip} from 'recharts';

var createReactClass = require('create-react-class');

class GroupQuestions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            grpQuestions: [],
            convoQuestionsArr: [],
            filteredDataList: []
        }

        this.componentWillMount = this.componentWillMount.bind(this);
    }

    componentWillMount() {
        this.fetchAllConversations();
    }

    fetchAllConversations() {
        var self = this;

        var myData = {
                    Body:"allcommands",
                    To: "",//"+19132703506",
                    From: ""//window.sessionStorage.getItem('phone')
        };

        ajax({
            method:'POST',
            url:'/api/convo',
            data: myData
        }).then(function(res, me) {
            let dataStr = res.data;
            let message = dataStr.substring(dataStr.lastIndexOf("<Message>")+1, dataStr.lastIndexOf("</Message>"));
            if (message != null) {
                var commands = self.retrieveCommands(message);
                console.log('Got this list of commands back: ' + commands);
                self.setState({ convoQuestionsArr: commands });
                self.fetchGroupQuestions();
            }
        }).catch(function(err){console.log(err)});
    }

    retrieveCommands(data) {
        var self = this;

        var matches = [];
        var done = [];

        var pattern = /\((.*?)\)/g;
        var match;
        while ((match = pattern.exec(data)) != null)
        {
          matches.push(match[1]);
        }

        for(var i=0; i<matches.length; i++) {
            let t = matches[i].split(" | ");
            for(var k=0; k<t.length;k++) {
                done.push(t[k])
            }
        }

        return self.cleanArray(done);
    }

    cleanArray(actual) {
      var newArray = [];
      for (var i = 0; i < actual.length; i++) {
        if (actual[i]) {
          newArray.push(actual[i]);
        }
      }
      return newArray;
    }

    fetchGroupQuestions() {
        var self = this;
        let questionsArr = this.state.convoQuestionsArr;
        ajax({ 
            method:'POST',
            url:'../api/convo/groupquestion',
            data: questionsArr
        }).then(function(res, me) {
            console.log(me);
            self.setState({ grpQuestions: res.data });
        }).catch(function(err){console.log(err)});
    }

    handleBarClick(element, id){ 
        console.log(`The bin ${element.text} with id ${id} was clicked`);
    }

    getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    compare(a,b) {
        if (a.count < b.count)
            return 1;
        if (a.count > b.count)
            return -1;
        return 0;
    }

    render() {
        var grpQuestions = [];
        for(var i=0;i<this.state.grpQuestions.length;i++) {
            var grpItem = {};
            if (this.state.grpQuestions[i] !== undefined) {
                    grpItem.name = this.state.grpQuestions[i].text;
                    grpItem.count = this.state.grpQuestions[i].value;
                    grpItem.fill = this.getRandomColor();
                    grpQuestions.push(grpItem);
                }
            }
        grpQuestions.sort(this.compare);

        const CustomTooltip = createReactClass({
                propTypes: {
                type: React.string,
                payload: React.array,
                label: React.string,
            },
            render() {
                const { active } = this.props;

                 if (active) {
                      const { payload } = this.props;
                       return (
                            <div className="custom-tooltip">
                                 <p className="desc">Question - Count</p>
                                 <p className="name">{`${payload[0].payload.name}`} - {`${payload[0].payload.count}`}</p>
                            </div>
                       );
                 }

                  return null;
            }
        });

        const renderLegend = (props) => {
             const { payload } = props;

             return (
                  <ul style={{listStyle: 'none', width: 200, marginTop: -50, marginLeft: 400}}><b>Question - Count</b>
                  {
                       payload.map((entry, index) => (
                            <li key={`item-${index}`}><div style={{width: '18%', height: '20px', float: 'left', backgroundColor: entry.payload.fill}}></div><div style={{ width: '80%', float: 'right'}}>{entry.value} - {entry.payload.count}</div></li>
                       ))
                  }
                  </ul>
             );
        }

        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12"><h1>Analytics</h1></div>
                </div>        

                <div className="row">
                    <div className="col-md-12">Group By Question</div>
                </div>
                <div className="row"> 
                    <div className="col-md-9">
                            <div  className="mainContent">
                                <RadialBarChart width={500} height={500} cx={150} cy={150} innerRadius={20} barCategoryGap={10} outerRadius={140} barSize={20} data={grpQuestions}>
                                    <RadialBar minAngle={15} background clockWise={true} dataKey='count'/>
                                    <Legend wrapperStyle={{ top: 25, right: 0, left: 0, bottom: 0 }} iconSize={10} top={10} layout='vertical' content={renderLegend}/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                </RadialBarChart>
                            </div>
                    </div>  
                    <div className="col-md-3">
                    </div>          
                </div>
            </div>
        );
    }
}

export default GroupQuestions;
