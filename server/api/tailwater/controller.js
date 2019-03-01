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


const ObjectId = require('mongodb').ObjectID;


const mongo = require('../../services/mongo');
// const fs = require('fs');


function get(req, res) {
    mongo.GetSort({}, {state: 1, name: 1}, 'Tailwater')
        .then(function (contact) {
            res.send(contact);
        });
}


function postInsert(req, res) {

    console.log(req.body);

    if (req.body.id) {
        mongo.Update({id: req.body.id}, req.body, 'Tailwater', {upsert: true})
            .then(() => {
                //  generateHTML();
                res.send(req.body);
            })
    }
}


function putUpdate(req, res) {

    if (req.body.id) {
        const {_id, id, location, type, state, flowData, name} = req.body;
        const query = {_id: ObjectId(_id)};

        const data = {};
        data.id = id;
        data.location = location;
        data.type = type;
        data.state = state;
        data.flowData = flowData;
        data.name = name;

        mongo.Update(query, data, 'Tailwater')
            .then(() => {

                // generateHTML();
                res.send(req.body);
            })
    }
}


function remove(req, res) {

    if (req.body.id) {
        mongo.DeleteOne(req.body.id, 'Tailwater')
            .then(function (contact) {
                res.send(contact);
            })
    }
}


function tailwaterHTML(req, res) {

    let stream = "";
    const write = function (value) {

        stream = stream + value;

    };

    mongo.GetSort({}, {state: 1, name: 1}, 'Tailwater')
        .then(function (list) {


            write("<head>><title>Tailwater</title></head>");
            write("<meta name='viewport' content='width=device-width, initial-scale=1'>");
            write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css">');
            write("</head>");

            write("<div class='container'>");
            write("<div class='row'>");
            write("<div class='col-md-7'>");
            write("<h2>Realtime Tailwater and Stream Info via Text Message</h2> <h3><em>by <a href='http://keyholesoftware.com'>keyholesoftware.com</a></h3>");
            write("</div>");
            write("</div>");
            write("<div class='row'>");
            write("<div class='col-md-7'>");
            write("<h3> <p> text -> gen 'SMS name' </p></h3>");
            write("</div>");
            write("</div>");
            write("<div class='row'>");
            write("<div class='col-md-7'>");
            write("<table class='table'>");
            write("<tr><th>State</th><th>Description</th><th>SMS Id Name</th>");
            list.forEach(item => write(`<tr><td>${item.state.toUpperCase()}</td> <td>${item.name}</td><td>${item.location}</td></tr>`));

            write("</table");
            write("</div>");
            write("</div>");
            write("</div>");
            //  stream.write("</div>");
            //  stream.end();

            res.send(stream);

        });

}


/*function generateHTML() {

    mongo.GetSort({}, {state: 1, name: 1}, 'Tailwater')
        .then(function (list) {

            const stream = fs.createWriteStream("public/tailwater.html");
            stream.once('open',  () => {
                stream.write("<head>><title>Tailwater</title></head>");
                stream.write("<meta name='viewport' content='width=device-width, initial-scale=1'>");
                stream.write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css">');
                stream.write("</head>");

                stream.write("<div class='container'>");
                stream.write("<div class='row'>");
                stream.write("<div class='col-md-7'>");
                stream.write("<h2>Realtime Tailwater and Stream Info via Text Message</h2> <h3><em>by <a href='http://keyholesoftware.com'>keyholesoftware.com</a></h3>");
                stream.write("</div>");
                stream.write("</div>");
                stream.write("<div class='row'>");
                stream.write("<div class='col-md-7'>");
                stream.write("<h3> <p> text -> gen 'SMS name' </p></h3>");
                stream.write("</div>");
                stream.write("</div>");
                stream.write("<div class='row'>");
                stream.write("<div class='col-md-7'>");
                stream.write("<table class='table'>");
                stream.write("<tr><th>State</th><th>Description</th><th>SMS Id Name</th>");
                list.forEach(item => write(`<tr><td>${item.state.toUpperCase()}</td> <td>${item.name}</td><td>${item.location}</td></tr>`));

                write("</table");
                write("</div>");
                write("</div>");
                write("</div>");
                //  stream.write("</div>");

            });

        });


}*/


module.exports = {
    postInsert: postInsert,
    putUpdate: putUpdate,
    get: get,
    remove: remove,
    // generateHTML: generateHTML,
    tailwaterHTML: tailwaterHTML
};
