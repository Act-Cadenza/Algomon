import { useCallback, useEffect, useMemo, useState } from "react";
import useWindowFocus from "./useWindowFocus";
import algosdk, { waitForConfirmation } from "algosdk";
import { CONSTANTS } from "./Constants";

const appIndex = CONSTANTS.APP_ID;

if (!localStorage.getItem("PeraWallet.BridgeURL")) {
  localStorage.setItem(
    "PeraWallet.BridgeURL",
    "wss://a.bridge.walletconnect.org"
  );
}

let client = new algosdk.Algodv2(
  CONSTANTS.algodToken,
  CONSTANTS.baseServer,
  CONSTANTS.port
);

export default function useWallet(peraWallet) {
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(false);
  const [walletInstalled, setInstalled] = useState(true);
  const [walletConnected, setConnected] = useState(false);
  const [walletAccount, setAccount] = useState("");
  const [optedIn, setOptedIn] = useState(false);
  const [defeated, setDefeated] = useState(false);
  const [fetching, setFetching] = useState([]);
  const [globalStates, setGlobalStates] = useState([]);

  const [isBattleOver, setIsBattleOver] = useState(false);
  const [isInBattle, setIsInBattle] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isCaught, setIsCaught] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const isWindowFocused = useWindowFocus();

  useEffect(() => {
    if (isWindowFocused) {
      // check status whenever the window focus status changes
    }
    const runUpdates = async () => {
      setConnected(await getWalletConnected());
      setLoading(false);
    };
    runUpdates();
  }, [isWindowFocused, setInstalled, setConnected, setLoading]);

  const nanParser = (val) => {
    return isNaN(val) ? 0 : val;
  };

  const checkOptedIn = async (sender, index) => {
    try {
      const counter = await client.getApplicationByID(index).do();
      if (!!counter.params["global-state"]) {
        setGlobalStates(
          counter.params["global-state"].map((_) => ({
            key: atob(_.key),
            value: _.value.uint,
          }))
        );
      }
      const appInfo = await client
        .accountApplicationInformation(sender, index)
        .do();
      if (appInfo["app-local-state"]) {
        if (appInfo["app-local-state"]["key-value"]) {
          const todoList = appInfo["app-local-state"]["key-value"];
          if (todoList.length > 0) {
            const finalTodo = todoList.map((_) => ({
              key: atob(_.key),
              value: _.value.uint,
            }));
            setIsInBattle(
              nanParser(finalTodo.find((_) => _.key === "isinBattle")?.value) ??
                false
            );
            setIsCaught(
              nanParser(finalTodo.find((_) => _.key === "isCaught")?.value) ??
                false
            );
            setIsBattleOver(
              nanParser(
                finalTodo.find((_) => _.key === "isBattleOver")?.value
              ) ?? false
            );
            setIsButtonDisabled(
              nanParser(
                finalTodo.find((_) => _.key === "isButtonDisabled")?.value
              ) ?? false
            );
            setIsGameOver(
              nanParser(finalTodo.find((_) => _.key === "isGameOver")?.value) ??
                false
            );
            setFetching(finalTodo);
          } else {
            setFetching([]);
          }
        } else {
          setFetching([]);
        }

        setOptedIn(true);
      }
    } catch (e) {
      console.log(e);
      setOptedIn(false);
      // console.error(`There was an error calling the app: ${e}`);
    }
  };

  const connectWallet = () => {
    return peraWallet.connect().then((newAccounts) => {
      peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
      checkOptedIn(newAccounts[0], CONSTANTS.APP_ID);
      setAccount(newAccounts);
      setConnected(true);
      return newAccounts;
    });
  };

  const onTodoAction = async (action, message) => {
    return await noop(appIndex, action, message, walletAccount[0]);
  };

  async function getWalletConnected() {
    return peraWallet.reconnectSession().then((accounts) => {
      // Setup disconnect event listener
      peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

      if (accounts.length) {
        setAccount(accounts);
        checkOptedIn(accounts[0], appIndex);
        return true;
      }
    });
  }

  const optIn = async () => {
    try {
      const index = CONSTANTS.APP_ID;
      const sender = walletAccount[0];
      const suggestedParams = await client.getTransactionParams().do();
      const optInTxn = algosdk.makeApplicationOptInTxn(
        sender,
        suggestedParams,
        index
      );
      const actionTxGroup = [{ txn: optInTxn, signers: [sender] }];
      const signedTx = await peraWallet.signTransaction([actionTxGroup]);
      console.log(signedTx);
      const { txId } = await client.sendRawTransaction(signedTx).do();
      const result = await waitForConfirmation(client, txId, 4);
      console.log(`Success`);
      setOptedIn(true);
      checkOptedIn(sender, appIndex);
    } catch (e) {
      setOptedIn(false);
      console.error(`There was an error calling the app: ${e}`);
    }
  };

  const noop = async (index, action) => {
    try {
      const accounts = await peraWallet.reconnectSession();
      const sender = accounts[0];
      const appArgs = [];
      appArgs.push(new Uint8Array(Buffer.from(action)));

      const suggestedParams = await client.getTransactionParams().do();
      // create unsigned transaction
      let actionTx = algosdk.makeApplicationNoOpTxn(
        sender,
        suggestedParams,
        index,
        appArgs
      );
      // Sign the transaction
      const actionTxGroup = [{ txn: actionTx, signers: [sender] }];

      const signedTx = await peraWallet.signTransaction([actionTxGroup]);
      console.log(signedTx);
      const { txId } = await client.sendRawTransaction(signedTx).do();
      const confirmedTxn = await waitForConfirmation(client, txId, 4);
      console.log("confirmed" + confirmedTxn);

      //Get the completed Transaction
      console.log(
        "Transaction " +
          txId +
          " confirmed in round " +
          confirmedTxn["confirmed-round"]
      );

      // display results
      let transactionResponse = await client
        .pendingTransactionInformation(txId)
        .do();
      console.log("Called app-id:", transactionResponse["txn"]["txn"]["apid"]);
      if (transactionResponse["global-state-delta"] !== undefined) {
        console.log(
          "Global State updated:",
          transactionResponse["global-state-delta"]
        );
      }
      if (transactionResponse["local-state-delta"] !== undefined) {
        console.log(
          "Local State updated:",
          transactionResponse["local-state-delta"]
        );
      }
      checkOptedIn(sender, CONSTANTS.APP_ID);
      console.log("success");
    } catch (err) {
      console.log(err);
    }
  };

  function handleDisconnectWalletClick() {
    localStorage.removeItem("walletconnect");
    localStorage.removeItem("PeraWallet.Wallet");
    setConnected(false);
    setAccount(null);
    setOptedIn(false);
    setDefeated(false);
    setFetching([]);
    setGlobalStates([]);
    setIsInBattle(false);
    setIsButtonDisabled(false);
    setIsCaught(false);
    setIsBattleOver(false);
    setIsGameOver(false);
  }

  return {
    loading,
    walletInstalled,
    walletConnected,
    walletAccount,
    connectWallet,
    fetching,
    optedIn,
    peraWallet,
    optIn,
    onTodoAction,
    handleDisconnectWalletClick,
    globalStates,
    defeated,
    trigger,
    setTrigger,
    isInBattle,
    isButtonDisabled,
    isCaught,
    isBattleOver,
    isGameOver,
  };
}
