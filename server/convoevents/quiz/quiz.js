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

'use strict';

const StateService = require('../../services/stateservice');
const pug = require('pug');
const config = require('../../config');
const mongo = require("../../services/mongo");

const host_url = config.url;
const template_dir = config.template_dir;

const quiz = [
    {
        question: 'First programmable computer?\n(a) Difference Engine (b) Eniac (c) Turing Machine',
        explain: "Charles Babbage invented the concept of the programmable computer and had built a programmable mechanical computer to prove concepts around 1822.",
        options: [
            {text: 'Difference Engine', abbr: 'a'},
            {text: 'Eniac', abbr: 'b'},
            {text: 'Turing Machine', abbr: 'c'}
        ],
        answer: 'a'
    },
    {
        question: 'Which is NOT a compiled language?\n(a) JavaScript (b) COBOL (c) Java (d) C#',
        explain: 'Cobol (Common Business Oriented Lanuage) is an imperative procedural based programming language invented by Grace Hoppper around 1961. JavaScript is interpreted at runtime by the client browser.',
        options: [
            {text: 'JavaScript', abbr: 'a'},
            {text: 'COBOL', abbr: 'b'},
            {text: 'Java', abbr: 'c'},
            {text: 'C-Sharp', abbr: 'd'}
        ],
        answer: 'a'
    },
    {
        question: 'Result in DECIMAL of this BINARY operation?\n111 + 100\n(a) 1011 (b) 211 (c) 11',
        explain: 'Binary addition is base two number system (i.e) 0 and 1, adding 111 + 100 = 1011 in binary. Decimal is base 10 number system.',
        options: [
            {text: '1011', abbr: 'a'},
            {text: '211', abbr: 'b'},
            {text: '11', abbr: 'c'}
        ],
        answer: 'c'
    },
    {
        question: 'What is the result of this JavaScript expression?\nif (10 == "10") { return true; } else { return false; }\n (a) true (b) false (c) exception',
        explain: 'JavaScript has two types of equality operations, "==" and "===". Double equals(==) checks if two values are equal to eachother. Triple equals (===) will perform a strict type comparison, requiring both operators to be of the same type... or an excpetion is thrown.',
        options: [
            {text: 'True', abbr: 'a'},
            {text: 'False', abbr: 'b'},
            {text: 'Exception', abbr: 'c'}
        ],
        answer: 'a'
    }
];


const drawing = function (session, request, even, data) {

    let u = "";

    for (let i = 0; i < request.question.length; i++) {
        u += request.question[i];
    }

    mongo.Insert({date: new Date, user: u, phone: request.phone}, "drawing");
    return data["5"].toUpperCase() + ", you are entered in the November 1 drawing for a $200.00 gift card, Thank you!";
};


const grade = function (session, request, event, data) {
    const compiledFunction = pug.compileFile(`${template_dir}/quiz/quiz.pug`, null );

    const questionsLength = quiz.length;
    let correctCount = 0;
    const result = [];

    for (let i = 0; i < questionsLength; i++) {
        if (data[""+(i+1)] === quiz[i].answer) {
            result.push({ text: 'Correct', item: quiz[i], input: data[""+(i+1)], correctAnswer: quiz[i].answer });
            correctCount++;
        } else {
            result.push({ text: 'Incorrect', item: quiz[i], input: data[""+(i+1)], correctAnswer: quiz[i].answer });
        }
    }

    const html = compiledFunction({url: host_url, results: result, score: (correctCount + "/" + questionsLength)});
    const word = event.words[0].word;
    result.push(`Your results: ${correctCount} / ${questionsLength} questions correct. Text your first and last name to be entered in a $200 Amazon gift card Drawing`);
    result.push(`LINK to Quiz Results and Explanations--> ${host_url}api/public/html/${request.phone}/${word}`);

    mongo.Update(
        { phone: request.phone, event: word },
        { phone: request.phone, event: word, html: html },
        "ui",
        { upsert: true });


    return result;
};


module.exports = function (events) {

    const event = {};
    event.states = [
        { reply: quiz[0].question, validator: 'choice:a,b,c,d', desc: '1' },
        { reply: quiz[1].question, validator: 'choice:a,b,c,d', desc: '2' },
        { reply: quiz[2].question, validator: 'choice:a,b,c', desc: '3' },
        { reply: quiz[3].question, validator: 'choice:a,b,c', desc: '4' },
        { reply: grade, desc: 'grade' },
        { reply: drawing, desc: 'drawing', postAction: 'stop'}
    ];

    event.isAuth = false;
    event.description = "Quiz";
    event.words = [{
        word: 'quiz',
        value: 10
    }];
    event.run = function (request) {
        // noinspection ES6ModulesDependencies
        return new Promise(function (resolve) {
            return resolve(StateService.doStates(event, request));
        });
    };

    events.push(event);
};


