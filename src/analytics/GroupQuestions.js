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


import '../styles/index.css';
import React from 'react';
import restAPI from '../service/restAPI';
import {connect} from "react-redux";
import BaseComponent from "../BaseComponent";
import {compare, cleanArray, getRandomColor} from '../util';
// noinspection ES6CheckImport
import {
    Container,
    Card,
    CardBody,
    CardTitle,
    Col,
    Row
} from 'mdbreact';
import HoverChart from "./helpers/HoverChart";


class GroupQuestions extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            grpQuestions: [],
            convoQuestionsArr: [],
            filteredDataList: []
        };

        this.componentWillMount = this.componentWillMount.bind(this);
    }


    componentWillMount() {
        super.componentWillMount();
        this.fetch();
    }


    fetch() {
        const self = this;

        const myData = {
            Body: "allcommands",
            To: "", //"913 2700360",
            From: this.props.credentials.phone
        };

        restAPI({
            method: 'post',
            url: '/api/convo/groupquestion',
            data: myData
        }).then(res => {
            const data = res.data;
            console.log(`Received Convos`, data);

            const message = data.slice(data.lastIndexOf('<Message>') + 1, data.lastIndexOf('</Message>'));
            if (message) {
                const commands = GroupQuestions.retrieveCommands(message);
                console.log(`Received command list`, commands);

                self.setState({convoQuestionsArr: commands});
                self.fetchGroupQuestions();
            }
        }).catch(err => console.log(err));
    }


    static retrieveCommands(data) {
        const matches = [];
        const done = [];

        const pattern = /\((.*?)\)/g;
        let match;
        while ((match = pattern.exec(data)) !== null) {
            matches.push(match[1]);
        }

        for (let i = 0; i < matches.length; i++) {
            const t = matches[i].split(" | ");
            for (let k = 0; k < t.length; k++) {
                done.push(t[k])
            }
        }

        return cleanArray(done);
    }


    fetchGroupQuestions() {
        const questionsArr = this.state.convoQuestionsArr;
        restAPI({
            method: 'POST',
            url: '../api/convo/groupquestion',
            data: questionsArr
        }).then(res => {
            console.log(res);
            this.setState({grpQuestions: res.data});
        }).catch(err => console.log(err));
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

        return (
            <Container>
                <Row>
                    <Col/>
                    <Col>
                        <Card style={{width: "48rem"}}>
                            <CardBody>
                                <CardTitle>Analytics</CardTitle>
                                <Row><Col>Group By Question - Hover Chart</Col></Row>
                                <Row>
                                    <Col className={"chart-main-content  scrollbar scrollbar-primary"}>
                                        <HoverChart data={grpQuestions} dataKey={"count"}
                                                    desc={"Question - Count"}/>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col/>
                </Row>
            </Container>
        );

    }
}

const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(GroupQuestions);
