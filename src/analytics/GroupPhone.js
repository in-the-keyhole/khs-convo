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
import '../styles/index.css';
import {compare, getRandomColor} from '../util';
import {connect} from "react-redux";
import BaseComponent from '../BaseComponent';
import CustomTooltip from '../common/CustomTooltips';
// noinspection ES6CheckImport
import {Card, CardBody, CardTitle, Row, Col} from 'mdbreact';


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
        this.fetchGroupPhones();
    }

    fetchGroupPhones() {
        const self = this;
        restAPI({
            url:'../api/convo/groupphone',
            data: this.state
        }).then( res => {
            console.log(res);
            self.setState({ grpPhone: res.data });
        }).catch(function(err){console.log(err)});
    }

    static handleBarClick(element, id){
        console.log(`The bin ${element.text} with id ${id} was clicked`);
    }


    render() {
        const grpPhones = [];
        for(let i=0; i<this.state.grpPhone.length; i++) {
            const grpItem = {};
            if (this.state.grpPhone[i] !== undefined) {
                grpItem.name = this.state.grpPhone[i].text;
                grpItem.count = this.state.grpPhone[i].value;
                grpItem.fill = getRandomColor();
                grpPhones.push(grpItem);
            }
        }
        grpPhones.sort(compare);


        const renderLegend = (props) => {
            const { payload } = props;

            return (
                <ul style={{listStyle: 'none', width: 200, marginTop: -50, marginLeft: 400}}><b>Phone Number- Count</b>
                {
                    payload.map((entry, index) => (
                        <li key={`item-${index}`}><div style={{width: '18%', height: '20px', float: 'left', backgroundColor: entry.payload.fill}}/><div style={{ width: '80%', float: 'right'}}>{entry.value} - {entry.payload.count}</div></li>
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
                        <Col>Group By Phone Number - Hoverchart</Col>
                    </Row>
                    <Row>
                        <Col md={"9"}>
                            <div className="mainContent">
                                <RadialBarChart width={500} height={500} cx={150} cy={150} innerRadius={20}
                                                barCategoryGap={10} outerRadius={140} barSize={20} data={grpPhones}>
                                    <RadialBar minAngle={15} background clockWise={true} dataKey='count'/>
                                    <Legend wrapperStyle={{top: 25, right: 0, left: 0, bottom: 0}} iconSize={10}
                                            top={10} layout='vertical' content={renderLegend}/>
                                    <Tooltip content={<CustomTooltip desc={"xxx Phone Number - Count"}/>}/>
                                </RadialBarChart>
                            </div>
                        </Col>
                        <Col md={"3"}>
                        </Col>

                    </Row>
                </CardBody>
            </Card>
        );
    }
}


const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(GroupPhone);
