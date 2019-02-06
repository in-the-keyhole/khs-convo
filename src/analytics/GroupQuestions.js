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
import restAPI from '../service/restAPI';
import { RadialBarChart, RadialBar, Legend, Tooltip} from 'recharts';
import {connect} from "react-redux";
import BaseComponent from "../BaseComponent";
import {compare, cleanArray, getRandomColor} from '../util';
import CustomTooltip from '../common/CustomTooltips';
// noinspection ES6CheckImport
import {Card, CardBody, CardTitle, Row, Col} from 'mdbreact';


class GroupQuestions extends BaseComponent {
    constructor(props) {
        super(props);
        console.log('GroupQuestions credentials', props.credentials);
        this.state = {
            grpQuestions: [],
            convoQuestionsArr: [],
            filteredDataList: []
        };

        this.componentWillMount = this.componentWillMount.bind(this);
    }

    componentWillMount() {
        super.componentWillMount();
        this.fetchAllConversations();
    }

    fetchAllConversations() {
        const self = this;

        const myData = {
            Body: "allcommands",
            To: "",//"+19132703506",
            From: ""//this.props.credentials.phone
        };

        restAPI({
            method:'POST',
            url:'/api/convo',
            data: myData
        }).then( res => {
            const dataStr = res.data;
            const message = dataStr.substring(dataStr.lastIndexOf("<Message>")+1, dataStr.lastIndexOf("</Message>"));
            if (message != null) {
                const commands = GroupQuestions.retrieveCommands(message);
                console.log('Got this list of commands back: ' + commands);
                self.setState({ convoQuestionsArr: commands });
                self.fetchGroupQuestions();
            }
        }).catch(function(err){console.log(err)});
    }

    static retrieveCommands(data) {
        const matches = [];
        const done = [];

        const pattern = /\((.*?)\)/g;
        let match;
        while ((match = pattern.exec(data)) !== null) {
          matches.push(match[1]);
        }

        for(let i=0; i<matches.length; i++) {
            const t = matches[i].split(" | ");
            for(let k=0; k<t.length; k++) {
                done.push(t[k])
            }
        }

        return cleanArray(done);
    }


    fetchGroupQuestions() {
        const self = this;
        const questionsArr = this.state.convoQuestionsArr;
        restAPI({
            method:'POST',
            url:'../api/convo/groupquestion',
            data: questionsArr
        }).then(function(res, me) {
            console.log(me);
            self.setState({ grpQuestions: res.data });
        }).catch(function(err){console.log(err)});
    }


    static handleBarClick(element, id){
        console.log(`The bin ${element.text} with id ${id} was clicked`);
    }


    render() {
        const grpQuestions = [];
        for (let i = 0; i < this.state.grpQuestions.length; i++) {
            const grpItem = {};
            if (this.state.grpQuestions[i] !== undefined) {
                grpItem.name = this.state.grpQuestions[i].text;
                grpItem.count = this.state.grpQuestions[i].value;
                grpItem.fill = getRandomColor();
                grpQuestions.push(grpItem);
            }
        }
        grpQuestions.sort(compare);


        const renderLegend = (props) => {
             const { payload } = props;

             return (
                  <ul style={{listStyle: 'none', width: 200, marginTop: -50, marginLeft: 400}}><b>Question - Count</b>
                  {
                       payload.map((entry, index) => (
                            <li key={`item-${index}`}>
                                <div style={{width: '18%', height: '20px', float: 'left', backgroundColor: entry.payload.fill}}>
                                </div>
                                <div style={{ width: '80%', float: 'right'}}>{entry.value} - {entry.payload.count}
                                </div>
                            </li>
                       ))
                  }
                  </ul>
             );
        };

        return (

            <Card>
                <CardBody>
                    <CardTitle>Analytics</CardTitle>
                    <Row>
                        <Col>Group By Question - Hoverchart</Col>
                    </Row>
                    <Row>
                        <Col md={"9"}>
                            <div className="mainContent">
                                <RadialBarChart width={500} height={500} cx={150} cy={150} innerRadius={20}
                                                barCategoryGap={10} outerRadius={140} barSize={20} data={grpQuestions}>
                                    <RadialBar minAngle={15} background clockWise={true} dataKey='count'/>
                                    <Legend wrapperStyle={{top: 25, right: 0, left: 0, bottom: 0}} iconSize={10}
                                            top={10} layout='vertical' content={renderLegend}/>
                                    <Tooltip content={<CustomTooltip desc={"Question - Count"}/>}/>
                                </RadialBarChart>
                            </div>
                        </Col>
                        <Col md={"3"}>
                        </Col>

                    </Row>
                </CardBody>
            </Card>
        );

/*        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12"><h1>Analytics</h1></div>
                </div>

                <div className="row">
                    <div className="col-md-12">Group By Question - Hoverchart</div>
                </div>
                <div className="row">
                    <div className="col-md-9">
                            <div  className="mainContent">
                                <RadialBarChart width={500} height={500} cx={150} cy={150} innerRadius={20}
                                                barCategoryGap={10} outerRadius={140} barSize={20} data={grpQuestions}>
                                    <RadialBar minAngle={15} background clockWise={true} dataKey='count'/>
                                    <Legend wrapperStyle={{ top: 25, right: 0, left: 0, bottom: 0 }} iconSize={10}
                                            top={10} layout='vertical' content={renderLegend}/>
                                    <Tooltip content={<CustomTooltip desc={"Question - Count"}/>}/>
                                </RadialBarChart>
                            </div>
                    </div>
                    <div className="col-md-3">
                    </div>
                </div>
            </div>
        );*/
    }
}

const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(GroupQuestions);
