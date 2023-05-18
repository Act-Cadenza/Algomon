import React, { useEffect, useState } from "react";

import BoxCanvas from "./BoxCanvas";
import Btn from "./components/BtnWallet";
import testnet from "./hooks/Testnet";
import Txt from "./components/TxtWallet";

export function App({ peraWallet }) {
  const {
    loading,
    walletInstalled,
    walletConnected,
    optedIn,
    fetching,
    inBattle,
    Err,
    isInBattle,
    isButtonDisabled,
    isCaught,
    isBattleOver,
    isGameOver,
    onTodoAction,
    optIn,
    connectWallet,
    handleDisconnectWalletClick,
  } = testnet(peraWallet);

  return (
    <div>
      <Txt
        stats={fetching}
        optedIn={optedIn}
        walletConnected={walletConnected}
      />
      <Btn
        handleDisconnectWalletClick={handleDisconnectWalletClick}
        optedIn={optedIn}
        optIn={optIn}
        loading={loading}
        walletInstalled={walletInstalled}
        walletConnected={walletConnected}
        connectWallet={connectWallet}
      />
      {optedIn && walletConnected && (
        <BoxCanvas
          stats={fetching}
          inBattle={inBattle}
          onTodoAction={onTodoAction}
          Err={Err}
          isInBattle={isInBattle}
          isButtonDisabled={isButtonDisabled}
          isCaught={isCaught}
          isBattleOver={isBattleOver}
          isGameOver={isGameOver}
        />
      )}
    </div>
  );
}

export default App;
