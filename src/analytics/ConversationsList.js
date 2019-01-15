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
// import {Table, Column} from 'fixed-data-table';
import '../styles/data-table.css';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

// let order = 'desc';

class ConversationsList extends React.Component {
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
            sizePerPage: this.props.sizePerPage,
            totalDataSize : 0,
        }

        this.componentWillMount = this.componentWillMount.bind(this);

        this.onPageChange = this.onPageChange.bind(this);
        this.onSizePerPageList = this.onSizePerPageList.bind(this);
        this.onSortChange = this.onSortChange.bind(this);
    }

    componentWillMount() {
        this.fetchConversationCount();
        this.fetchConversationsByChunk();
    }

    fetchAllConversations() {
        var self = this;
        ajax({
            url:'../api/convo/all',
            data: this.state
        }).then(function(res, me) {
            console.log(me);
            self.setState({ filteredDataList: res.data });
        }).catch(function(err){console.log(err)});
    }

    fetchConversationsByChunk(skipCount, limitCount) {
            var self = this;
            if (skipCount !== undefined) self.state.skipCount = skipCount;
            if (limitCount !== undefined) self.state.limitCount = limitCount;
            ajax({
                url:'../api/convo/getconvochunk?skipCount=' + self.state.skipCount + '&limitCount=' + self.state.limitCount,
                data: this.state
            }).then(function(res, me) {
                self.setState({ filteredDataList: res.data,
                    sizePerPage: limitCount,
                    limitCount: limitCount
                 });
            }).catch(function(err){console.log(err)});
        }

    fetchConversationCount() {
            var self = this;
            ajax({
                url:'../api/convo/getconvocount',
                data: this.state
            }).then(function(res, me) {
                self.setState({ convoCount: res.data,
                totalDataSize: res.data});
            }).catch(function(err){console.log(err)});
        }

    onSortChange(sortName, sortOrder){
        let _data = this.state.filteredDataList;
        if (sortOrder === 'desc') {
             _data.sort(function(a, b) {
                  if (a[sortName] > b[sortName]) {
                       return -1;
                  } else if (b[sortName] > a[sortName]) {
                       return 1;
                  }
                   return 0;
             });
        } else {
             _data.sort(function(a, b) {
                  if (a[sortName] > b[sortName]) {
                      return 1;
                  } else if (b[sortName] > a[sortName]) {
                      return -1;
                  }
                  return 0;
             });
        }

        this.setState({ filteredDataList: _data });
    }

    onPageChange(page, sizePerPage) {
        if (isNaN(page)) {
            page = this.state.convoCount / sizePerPage;
        }
        const skipCount = (page * sizePerPage) - sizePerPage;
        this.fetchConversationsByChunk(skipCount, sizePerPage);
        this.setState( {sizePerPage: sizePerPage} );
    }

    onSizePerPageList(sizePerPage) {
        const currentIndex = (this.state.currentPage - 1) * sizePerPage;
        this.setState({
          filteredDataList: this.state.filteredDataList.slice(currentIndex, currentIndex + sizePerPage),
          sizePerPage: sizePerPage
        });
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12"><h1>Analytics</h1></div>
                </div>
                <div className="row">
                    <div className="col-md-12">Conversations</div>
                </div>
                <div className="row">
                    <BootstrapTable
                        data={ this.state.filteredDataList } remote={true} pagination={true}
                        fetchInfo={{ dataTotalSize: this.totalDataSize }}
                        options={{ sizePerPage: this.props.sizePerPage,
                                    alwaysShowAllBtns: true,
                                    withFirstAndLast: false,
                                    onPageChange: this.onPageChange,
                                    sizePerPageList: [5, 10, 15],
                                    page: this.currentPage,
                                    onSizePerPageList: this.onSizePerPageList,
                                    onSortChange: this.onSortChange}}>
                        <TableHeaderColumn dataField='_id' isKey hidden={ true }>ID</TableHeaderColumn>
                        <TableHeaderColumn dataField='date' dataSort={ true }>Date</TableHeaderColumn>
                        <TableHeaderColumn dataField='phone' dataSort={ true }>Phone</TableHeaderColumn>
                        <TableHeaderColumn dataField='question' dataSort={ true }>Question</TableHeaderColumn>
                        <TableHeaderColumn dataField='answer' dataSort={ true }>Answer</TableHeaderColumn>
                    </BootstrapTable>
                </div>
            </div>
        );
    }
}

export default ConversationsList;
