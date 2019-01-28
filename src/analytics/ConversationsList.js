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
import paginationFactory from 'react-bootstrap-table2-paginator';
import {pageinationOptions} from '../common/pageinationOptions';
import BootstrapTable from 'react-bootstrap-table-next';
import CommonUI from '../common/CommonUI';
import '../styles/data-table.css';
// noinspection ES6CheckImport
import {
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    Col,
    Row
} from 'mdbreact';
import BaseComponent from '../BaseComponent';
import {connect} from "react-redux";

class ConversationsList extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            convos: [],
            filteredDataList: [],
            sortBy: 'id',
            sortDir: null,
            skipCount: 0,
            limitCount: 10,
            convoCount: 0,
            currentPage: 1,
            sizePerPage: 10,
            totalDataSize: 0,
        };

        console.log(`props`, props);

        this.componentWillMount = this.componentWillMount.bind(this);
        this.onPageChange = this.onPageChange.bind(this);
        this.onSizePerPageList = this.onSizePerPageList.bind(this);
        this.onSortChange = this.onSortChange.bind(this);
        this.getPaginationOptions = this.getPaginationOptions.bind(this);
    }

    getPaginationOptions(baseOptions){
        const opts = baseOptions;
        opts.currSizePerPage = this.state.sizePerPage;
        opts.totalSize = this.state.totalDataSize;
            // alwaysShowAllBtns: true,
            // withFirstAndLast: false,
        opts.onPageChange = this.onPageChange;
        opts.currPage = this.currentPage;
        opts.onSizePerPageList = this.onSizePerPageList;
        opts.onSortChange = this.onSortChange;
        return opts;
    }


    componentWillMount() {
        super.componentWillMount();
        this.fetchConversationCount();
        // this.fetchConversationsByChunk();
        this.fetchAllConversations();
    }


    fetchAllConversations() {
        const self = this;
        restAPI({
            url: '../api/convo/all',
            data: this.state
        }).then( res => {
            console.log(res);
            self.setState({filteredDataList: res.data});
        }).catch(function (err) {
            console.log(err)
        });
    }

    fetchConversationsByChunk(skipCount, limitCount) {
        const self = this;
        if (skipCount !== undefined) self.state.skipCount = skipCount;
        if (limitCount !== undefined) self.state.limitCount = limitCount;
        restAPI({
            url: '../api/convo/getconvochunk?skipCount=' + self.state.skipCount + '&limitCount=' + self.state.limitCount,
            data: this.state
        }).then(res => {
            self.setState({
                filteredDataList: res.data,
                sizePerPage: limitCount,
                limitCount: limitCount
            });
        }).catch(err => console.log(err));
    }

    fetchConversationCount() {
        const self = this;
        restAPI({
            url: '../api/convo/getconvocount',
            data: this.state
        }).then(res => {
            self.setState({
                convoCount: res.data,
                totalDataSize: res.data
            });
        }).catch(err => console.log(err));
    }

    onSortChange(sortName, sortOrder) {
        const _data = this.state.filteredDataList;
        if (sortOrder === 'desc') {
            _data.sort(function (a, b) {
                if (a[sortName] > b[sortName]) {
                    return -1;
                } else if (b[sortName] > a[sortName]) {
                    return 1;
                }
                return 0;
            });
        } else {
            _data.sort(function (a, b) {
                if (a[sortName] > b[sortName]) {
                    return 1;
                } else if (b[sortName] > a[sortName]) {
                    return -1;
                }
                return 0;
            });
        }

        this.setState({filteredDataList: _data});
    }

    onPageChange(pageArg, sizePerPage) {
        const page = (isNaN(pageArg)) ? this.state.convoCount / sizePerPage : pageArg;

        const skipCount = (page * sizePerPage) - sizePerPage;
        this.fetchConversationsByChunk(skipCount, sizePerPage);
        this.setState({sizePerPage: sizePerPage});
    }

    onSizePerPageList(sizePerPage) {
        const currentIndex = (this.state.currentPage - 1) * sizePerPage;
        this.setState({
            filteredDataList: this.state.filteredDataList.slice(currentIndex, currentIndex + sizePerPage),
            sizePerPage: sizePerPage
        });
    }

    static phoneNumberFormatter(cell){
        return cell ? cell.toString().slice(0, 20) : '';
    }

    static questionFormatter(cell){
        return cell ? cell.toString().slice(0, 26) : '';
    }

    static answerFormatter(cell){
        const maxLen = 75;
        const val = cell.toString();
        const len = val.length;
        return len > maxLen ? `${val.slice(0, maxLen)} ...` : val;
    }

    render() {

        const columns = [
            {
                text: '_id',
                hidden: true,
                dataField: '_id',
                isKey: true
            },
            {
                text: 'Date',
                dataField: 'date',
                // sort: true,
                sortCaret: CommonUI.ColumnSortCaret
            },
            {
                text: 'Phone',
                dataField: 'phone',
                formatter: (ConversationsList.phoneNumberFormatter),
                // sort: true,
                sortCaret: CommonUI.ColumnSortCaret
            },
            {
                text: 'Question',
                dataField: 'question',
                formatter: (ConversationsList.questionFormatter),
                // sort: true,
                sortCaret: CommonUI.ColumnSortCaret
            },
            {
                text: 'Answer',
                dataField: 'answer',
                formatter: (ConversationsList.answerFormatter),
                // sort: true,
                sortCaret: CommonUI.ColumnSortCaret
            },
            {
                text: 'word',
                hidden: true,
                dataField: 'word',
            }
        ];

        return (
            <MDBCard>
                <MDBCardBody>
                    <MDBCardTitle>Analytics</MDBCardTitle>
                    <Row><Col>Conversations</Col></Row>
                    <Row>
                        <Col>
                            <BootstrapTable
                                bootstrap4
                                keyField={'_id'}
                                columns={columns}
                                // data={this.state.filteredDataList}
                                data={this.state.filteredDataList}
                                // defaultSorted={[{dataField: 'date', order: 'desc'}]}
                                noDataIndication="No conversations"
                                remote={false}
                                pagination={paginationFactory(pageinationOptions)}
                                // fetchInfo={{dataTotalSize: this.totalDataSize}}
                                // options={{
                                //     sizePerPage: this.props.sizePerPage,
                                //     // alwaysShowAllBtns: true,
                                //     // withFirstAndLast: false,
                                //     onPageChange: this.onPageChange,
                                //     // sizePerPageList: [10, 25, 30, 50],
                                //     page: this.currentPage,
                                //     onSizePerPageList: this.onSizePerPageList,
                                //     onSortChange: this.onSortChange
                                // }}
                            />
                        </Col>
                    </Row>
                </MDBCardBody>
            </MDBCard>
        );
    }
}

const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(ConversationsList);

