import React, { useContext, useState } from "react";
import { AppContext } from "../../App";
import { RollbackOutlined, SendOutlined, SmileOutlined, WarningOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { MsVaultContext } from "./MultiSig";
import { dialogOverlayGradient, errorColor, softTextColor, softBorder, cardGradientGrey } from "../../styles";

const MSTransactionActions = ({ transaction, canConfirm, canExecute, canRevoke, writeContracts }) => {
  const { tx } = useContext(AppContext);
  const { balance } = useContext(MsVaultContext);

  const [pendingActionConfirm, setPendingActionConfirm] = useState();
  const [pendingActionRevoke, setPendingActionRevoke] = useState();
  const [pendingActionExecute, setPendingActionExecute] = useState();

  const confirmTx = () => {
    setPendingActionConfirm(true);
    const confTx = writeContracts.MultiSigVault.confirmTransaction(transaction.idx);
    tx(confTx, update => {
      if (update && (update.error || update.reason)) {
        setPendingActionConfirm(false);
      }
      if (update && (update.status === "confirmed" || update.status === 1)) {
        setPendingActionConfirm(false);
      }
      if (update && update.code) {
        // metamask error
        // may be that user denied transaction, but also actual errors
        // handle them particularly if you need to
        // https://github.com/MetaMask/eth-rpc-errors/blob/main/src/error-constants.ts
        setPendingActionConfirm(false);
      }
    });
  };

  const executeTx = () => {
    setPendingActionExecute(true);
    const execTx = writeContracts.MultiSigVault.executeTransaction(transaction.idx);
    tx(execTx, update => {
      if (update && (update.error || update.reason)) {
        setPendingActionExecute(false);
      }
      if (update && (update.status === "confirmed" || update.status === 1)) {
        setPendingActionExecute(false);
      }
      if (update && update.code) {
        // metamask error
        // may be that user denied transaction, but also actual errors
        // handle them particularly if you need to
        // https://github.com/MetaMask/eth-rpc-errors/blob/main/src/error-constants.ts
        setPendingActionExecute(false);
      }
    });
  };

  const revokeTx = () => {
    setPendingActionRevoke(true);
    const revokeTx = writeContracts.MultiSigVault.revokeConfirmation(transaction.idx);
    tx(revokeTx, update => {
      if (update && (update.error || update.reason)) {
        setPendingActionRevoke(false);
      }
      if (update && (update.status === "confirmed" || update.status === 1)) {
        setPendingActionRevoke(false);
      }
      if (update && update.code) {
        // metamask error
        // may be that user denied transaction, but also actual errors
        // handle them particularly if you need to
        // https://github.com/MetaMask/eth-rpc-errors/blob/main/src/error-constants.ts
        setPendingActionRevoke(false);
      }
    });
  };

  const insufficientFunds = transaction.value.gt(balance);

  const actionButtonWith = (text, action, icon, pendingAction, type, disabled) => (
    <Button
      size="large"
      type={type}
      onClick={action}
      style={{ minWidth: "8rem" }}
      loading={pendingAction}
      disabled={disabled}
    >
      {text}
      {icon}
    </Button>
  );
  const positiveActionButton = canConfirm
    ? actionButtonWith("Confirm", confirmTx, <SmileOutlined />, pendingActionConfirm, "primary")
    : canExecute
    ? actionButtonWith("Execute", executeTx, <SendOutlined />, pendingActionExecute, "primary", insufficientFunds)
    : "";

  const revokeButton = canRevoke
    ? actionButtonWith("Revoke", revokeTx, <RollbackOutlined />, pendingActionRevoke, "secondary")
    : "";

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ flex: "1", display: "flex", justifyContent: revokeButton ? "space-between" : "flex-end" }}>
          {revokeButton}
          {positiveActionButton}
        </div>
      </div>
      {insufficientFunds && (
        <div
          style={{
            marginTop: "1rem",
            // color: canExecute ? errorColor : softTextColor,
            color: errorColor,
            textAlign: "center",
            // background: dialogOverlayGradient,
            background: cardGradientGrey,
            padding: "0.5rem",
            border: softBorder,
          }}
        >
          <WarningOutlined /> Insufficient funds for the transaction
        </div>
      )}
    </div>
  );
};

export default MSTransactionActions;
