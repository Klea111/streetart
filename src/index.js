import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import reducer from "./reducer";
import { loadUser } from "./apiClient";
import thunkMiddleWare from "redux-thunk";

let store;
(() => {
    let initialState = {};
    loadUser()
        .then(user => {
            if (user) {
                initialState.user = user;
            }
        })
        .catch(error => {})
        .finally(() => {
            const enhancer = composeWithDevTools(applyMiddleware(thunkMiddleWare));
            const store = createStore(reducer, initialState, enhancer);
            ReactDOM.render(
                <Provider store={store}>
                    <React.StrictMode>
                        <App />
                    </React.StrictMode>
                </Provider>,
                document.getElementById("root")
            );
        });
})();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
