import React from "react";
import "../BoxCanvas.css";
import "./TxtWallet.css";
import logo from "../maps/logo.png";
import { motion } from "framer-motion";
export default function Bio({ stats, optedIn, walletConnected }) {
  if (!walletConnected) {
    return (
      <div className="centered">
        <motion.img
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="logo-size"
          src={logo}
          alt="logo"
        />
        <h3 className="txt-shadow">Please connect your wallet first.</h3>
      </div>
    );
  }

  if (!optedIn) {
    return (
      <div className="centered">
        <h3 className="txt-shadow">Register to play.</h3>
      </div>
    );
  }

  return (
    <div className="absol">
      <p className="txt-shadow">
        Total of creatures Captured in the area:
        {stats.find((_) => _.key === "Total")?.value}
      </p>
    </div>
  );
}
