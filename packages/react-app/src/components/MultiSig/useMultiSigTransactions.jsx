import { useEventListener } from "eth-hooks/events/useEventListener";
import { useState, useEffect } from "react";

export const useMultiSigTransactions = (provider, readContracts) => {
  const [initializing, setInitializing] = useState(true);
  const [transactions, setTransactions] = useState();

  const [lastSubmittedTxs, setLastSubmittedTxs] = useState();
  const [lastExecutedTxs, setLastExecutedTxs] = useState();

  // like rxjs combinelatest
  const combineSubmittedAndExecuted = () => {
    if (!(lastSubmittedTxs && lastExecutedTxs)) return;

    const pending = [];
    const executed = [];

    lastSubmittedTxs.forEach(tx => {
      const execIdx = lastExecutedTxs.findIndex(t => t.idx.toNumber() === tx.idx.toNumber());
      if (execIdx !== -1) {
        tx.executed = true;
        tx.dateExecuted = lastExecutedTxs[execIdx].dateExecuted;
        executed.push(tx);
      } else {
        // if execute event not here yet, treat as pending
        // tx.executed = false;
        pending.push(tx);
      }
    });

    setTransactions({
      pending,
      executed,
    });
    setInitializing(false);
  };
  const [updateNonce, setUpdateNonce] = useState(0);
  useEffect(() => combineSubmittedAndExecuted(updateNonce), [updateNonce]);

  const submitTxEvents = useEventListener(readContracts, "MultiSigSafe", "SubmitTransaction", provider, 1);
  useEffect(() => {
    if (!transactions || submitTxEvents.length !== transactions.pending.length + transactions.executed.length) {
      const submittedTxs = submitTxEvents
        .map(event => ({
          owner: event.args.owner,
          idx: event.args.txIndex,
          to: event.args.to,
          value: event.args.value,
          data: event.args.data,
          dateSubmitted: new Date(event.args.timestamp.toNumber() * 1000),
        }))
        .reverse();
      const txsDetailsPromises = submittedTxs.map(tx => readContracts.MultiSigSafe.getTransaction(tx.idx));
      Promise.all(txsDetailsPromises).then(txsDetails => {
        submittedTxs.forEach((tx, idx) => {
          tx.executed = txsDetails[idx].executed;
          tx.numConfirmations = txsDetails[idx].numConfirmations.toNumber();
        });
        setLastSubmittedTxs(submittedTxs);
        setUpdateNonce(Math.random());
      });
    }
  }, [submitTxEvents]);

  const executeTxEvents = useEventListener(readContracts, "MultiSigSafe", "ExecuteTransaction", provider, 1);
  useEffect(() => {
    const executedTxs = executeTxEvents.map(event => ({
      owner: event.args.owner,
      idx: event.args.txIndex,
      dateExecuted: new Date(event.args.timestamp.toNumber() * 1000),
    }));
    setLastExecutedTxs(executedTxs);
    setUpdateNonce(Math.random());
  }, [executeTxEvents]);

  return { initializing, transactions };
};
