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

import React, {Component} from 'react';
import {Footer} from "mdbreact";

class FooterPanel extends Component {
    render() {
        return (
            <Footer >
                <div className="footer-copyright text-center py-3">
                    &copy; {new Date().getFullYear()} Copyright: KeyHole Software -
                    <a target={"_blank"}
                       href="https://keyholesoftware.com/company/creations/content-usage-guidelines/"> Content Usage
                        Guidelines </a>

                </div>
            </Footer>
        )
    }
}

export default FooterPanel
