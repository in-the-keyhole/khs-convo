/*
 * Copyright (c) 2019 Keyhole Software LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Configures a redux store to hold the authenticated user credentials
// the caller, the root component tree would presumabley wrap the kids
// in a Provider tag to make the store available throughout the components

import rootReducer from './reducers';
import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger'

export default function configureStore() {
    const middleware = [ thunk ];
    if (process.env.NODE_ENV !== 'production') {
        middleware.push(createLogger());
    }

    return  createStore(
        rootReducer,
        composeWithDevTools(applyMiddleware(...middleware))
    );
}
