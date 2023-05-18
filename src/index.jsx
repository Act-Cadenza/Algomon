// import React from 'react';
// import ReactDOM from 'react-dom/client';

// import { App } from './App.jsx'

// ReactDOM.createRoot( 
//   document.querySelector('#root')
// ).render(<App />)

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { PeraWalletConnect } from "@perawallet/connect";

const peraWallet = new PeraWalletConnect();

ReactDOM.render(
  <React.StrictMode>
    <App peraWallet={peraWallet} />
  </React.StrictMode>,
  document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

