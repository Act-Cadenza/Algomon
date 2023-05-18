import React from "react";
import "./TxtWallet.css";

export default function Wallet({
  loading,
  walletInstalled,
  walletConnected,
  optedIn,
  optIn,
  connectWallet,
  handleDisconnectWalletClick,
}) {
  if (loading) {
    return <p className="txt-shadow">loading</p>;
  }

  return (
    <div className="centered">
      {!walletInstalled}
      {!walletConnected && (
        <button
          id="button-connect"
          className="top-layer txt-shadow"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}
      {walletConnected && (
        <div>
          <div className="top-layer txt-shadow">
            <span />
            Wallet Connected
          </div>
        </div>
      )}
      {walletConnected && (
        <button
          className="top-layer txt-shadow"
          onClick={handleDisconnectWalletClick}
        >
          Disconnect Wallet
        </button>
      )}
      <div>
        <div>
          {walletConnected && !optedIn && (
            <button className="top-layer txt-shadow" onClick={optIn}>
              Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
