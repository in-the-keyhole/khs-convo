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
import {Card, CardBody, CardTitle, Col, Row} from 'mdbreact';
import BaseComponent from '../BaseComponent';
import {connect} from "react-redux";

const IS_REMOTE_SCROLLING = false;

class ConversationsList extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            convoCount: 0,
            filteredDataList: [],
            sortBy: '_id',
            sortDir: null,
            skipCount: 0,
            limitCount: 10,
            currentPage: 1,
            sizePerPage: 10,
            currSizePerPage: 10,
            paginationSize: 10,
            totalDataSize: 0,
            showTotal: true
        };

        console.log(`ConversationsList props`, props);

        this.componentWillMount = this.componentWillMount.bind(this);
        this.onPageChange = this.onPageChange.bind(this);
        this.onSizePerPageList = this.onSizePerPageList.bind(this);
        this.onSortChange = this.onSortChange.bind(this);
        this.getPaginationOptions = this.getPaginationOptions.bind(this);
        this.onTableChange = this.onTableChange.bind(this);
    }

    getPaginationOptions(baseOptions) {
        const opts = {};
        opts.onPageChange = this.onPageChange;
        opts.onSizePerPageList = this.onSizePerPageList;
        // opts.onSortChange = this.onSortChange;
        opts.alwaysShowAllBtns = false;
        opts.withFirstAndLast = true;
        opts.page = this.state.currentPage;
        opts.sizePerPage = this.state.sizePerPage;
        opts.currSizePerPage = this.state.currSizePerPage;
        opts.paginationSize = this.state.paginationSize;
        opts.totalSize = this.state.totalDataSize;
        opts.showTotal = this.state.showTotal;
        opts.sizePerPageList = [10, 15, 25, 50];

        return Object.assign({}, opts, baseOptions);
    }


    componentWillMount() {
        super.componentWillMount();
        this.fetchConversationCount();
        IS_REMOTE_SCROLLING ? this.fetchConversationsByChunk() : this.fetchAllConversations();
    }


    /**
     * Used only for local scrolling option
     */
    fetchAllConversations() {
        restAPI({
            url: '../api/convo/all',
            data: this.state
        }).then(res => {
            console.log(res);
            this.setState({filteredDataList: res.data});
        }).catch(function (err) {
            console.log(err)
        });
    }

    /**
     * Used only for remote scrolling option
     */
    fetchConversationsByChunk(skipCount, limitCount) {
        if (skipCount) this.state.skipCount = skipCount;
        if (limitCount) this.state.limitCount = limitCount;
        restAPI({
            url: `../api/convo/getconvochunk?skipCount=${this.state.skipCount}&limitCount=${this.state.limitCount}`,
            data: this.state
        }).then(res => {
            this.setState({
                filteredDataList: res.data,
                sizePerPage: limitCount,
                limitCount: limitCount
            });
        }).catch(err => console.log(err));
    }

    fetchConversationCount() {
        restAPI({
            url: '../api/convo/getconvocount',
            data: this.state
        }).then(res => {
            this.setState({
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
        this.setState( {page: page, sizePerPage: sizePerPage} );
    }

    onSizePerPageList(sizePerPage) {
        const currentIndex = (this.state.currentPage - 1) * sizePerPage;
        this.setState({
            filteredDataList: this.state.filteredDataList.slice(currentIndex, currentIndex + sizePerPage),
            sizePerPage: sizePerPage
        });
    }

    static _slicer(cell, maxLen){
        return cell ? cell.toString().slice(0, maxLen) : '';
    }

    static phoneNumberFormatter(cell) {
        return ConversationsList._slicer(cell, 20);
    }

    static questionFormatter(cell) {
        return ConversationsList._slicer(cell, 26);
    }

    static answerFormatter(cell) {
        const maxLen = 75;
        const val = cell ? cell.toString() : '';
        return val.length > maxLen ? `${ConversationsList._slicer(val, maxLen)} ...` : val;
    }


    /**
     * See https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/table-props.html#ontablechange-function
     * Specify the onTableChange prop on a React BootStrap Table 2
     *
     * Allowed values of type, a key to newState
     *      - filter
     *      - pagination
     *      - sort
     *      - cellEdit
     *
     *  Shape of newSate
     *
     *   {
     *       page,  // newest page
     *       sizePerPage,  // newest sizePerPage
     *       sortField,  // newest sort field
     *       sortOrder,  // newest sort order
     *       filters, // an object which have current filter status per column
     *       data, // when you enable remote sort, you may need to base on data to sort if data is filtered/searched
     *       cellEdit: {  // You can only see this prop when type is cellEdit
     *           rowId,
     *           dataField,
     *           newValue
     *   }
     *
     * @param type as listed above
     * @param newState next React state to be set
     */
    onTableChange(type, newState) {
        // const types = ['filter', 'pagination', 'sort', 'cellEdit'];
        if (type === 'pagination') {
            console.log(`newState`, newState);
            this.setState({page: newState.page, sizePerPage: newState.sizePerPage});
        }
    }


    render() {
        this.mergedPaginationOptions = this.getPaginationOptions(pageinationOptions);

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
                sort: true,
                sortCaret: CommonUI.ColumnSortCaret
            },
            {
                text: 'Phone',
                dataField: 'phone',
                formatter: (ConversationsList.phoneNumberFormatter),
                sort: true,
                sortCaret: CommonUI.ColumnSortCaret
            },
            {
                text: 'Question',
                dataField: 'question',
                formatter: (ConversationsList.questionFormatter),
                sort: true,
                sortCaret: CommonUI.ColumnSortCaret
            },
            {
                text: 'Answer',
                dataField: 'answer',
                formatter: (ConversationsList.answerFormatter),
                sort: true,
                sortCaret: CommonUI.ColumnSortCaret
            },
            {
                text: 'word',
                hidden: true,
                dataField: 'word',
            }
        ];

        return (
            <Card>
                <CardBody>
                    <CardTitle>Analytics</CardTitle>
                    <Row><Col>Conversations</Col></Row>
                    <Row>
                        <Col>
                            <BootstrapTable
                                bootstrap4
                                keyField={'_id'}
                                columns={columns}
                                data={this.state.filteredDataList}
                                defaultSorted={[{dataField: 'date', order: 'desc'}]}
                                noDataIndication="No conversations"
                                remote={IS_REMOTE_SCROLLING}
                                onTableChange={this.onTableChange}
                                onSizePerPageList={this.onSizePerPageList}
                                page={this.state.currentPage}
                                fetchInfo={{dataTotalSize: this.totalDataSize}}
                                pagination={paginationFactory(IS_REMOTE_SCROLLING
                                    ? this.mergedPaginationOptions : pageinationOptions)}
                                currSizePerPage={this.state.currSizePerPage}

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
                </CardBody>
            </Card>
        );
    }
}

const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(ConversationsList);

