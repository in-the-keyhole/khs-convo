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
// noinspection ES6CheckImport
import {Footer} from "mdbreact";

const styleA = {
    color: "#333",
    backgroundColor: "#f0f0f0",
    fontWeight: 200,
    borderBottom: "4px inset #ddd"
};

const styleLink = {
    color: "#00d",
    backgroundColor: "#f0f0f0",
    fontWeight: 300
};

const crUrl = 'https://keyholesoftware.com/company/creations/content-usage-guidelines/';

export const FooterPanel = (/*props*/) => (
    <Footer>
        <div className="footer-copyright text-center py-3" style={styleA}>
            &copy; {new Date().getFullYear()} Copyright: KeyHole Software -&nbsp;
            <a target={"_blank"} style={styleLink}
               href={crUrl}> Content Usage
                Guidelines </a>

        </div>
    </Footer>
);
