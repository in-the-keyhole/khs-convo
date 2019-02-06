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
import {compare, getRandomColor} from '../util';
import {connect} from "react-redux";
import BaseComponent from '../BaseComponent';
import HoverChart from './helpers/HoverChart';
// noinspection ES6CheckImport
import {Card, CardBody, CardTitle, Col, Row} from 'mdbreact';


/**
 * Extracts non-null phone group items, migrating them into
 * a sorted list suitable for a React Chart legend.
 *
 * @param group
 * @returns {this}
 */
const extractPhoneItems = (group) => {

    return ( groupValue => {
        const newList = [];

        groupValue
            .filter(v => {
                return v != null;
            })
            .map(v => {
                const phoneItem = {};
                phoneItem.name = v.text;
                phoneItem.count = v.value;
                phoneItem.fill = getRandomColor();
                newList.push(phoneItem);
                return null;
            });

        return newList;
    })(group).sort(compare);
};

/**
 * Analytics - Phone Groups main component
 */
class GroupPhone extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            grpPhone: []
        };

        this.componentWillMount = this.componentWillMount.bind(this);
    }

    componentWillMount() {
        super.componentWillMount();
        this.fetchGroupQuestions();
    }

    fetchGroupQuestions() {
        const self = this;
        restAPI({
            url: '../api/convo/groupphone',
            data: this.state
        }).then(res => {
            console.log(res);
            self.setState({grpPhone: res.data});
        }).catch(function (err) {
            console.log(err)
        });
    }


    render() {

        return (
            <Card>
                <CardBody>
                    <CardTitle>Analytics</CardTitle>
                    <Row><Col>Group By Phone Number - Hover Chart</Col></Row>
                    <Row>
                        <Col className={"chart-main-content"}>
                            <HoverChart data={extractPhoneItems(this.state.grpPhone)} dataKey={"count"} desc={"Phone Number - Count"}/>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        );
    }
}


const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(GroupPhone);
