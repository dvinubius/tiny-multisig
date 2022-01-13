import { Descriptions, Spin, Divider } from "antd";
import { useOnBlock } from "eth-hooks";
import React, { useContext, useEffect, useState } from "react";
import { AppContext, LayoutContext } from "../../App";
import {
  breakPointMsTxDetailsFit,
  nestedCardBGLight,
  softBorder2,
  primaryColor,
  softTextColor,
  swapGradient,
  cardGradient,
} from "../../styles";
import MSTransactionActions from "./MSTransactionActions";
import { contentWrapperStyle, labelStyle } from "./MSTransactionStyles";
import { MsSafeContext } from "./MultiSig";
import Owners from "./Owners";

const MSTransactionDetails = ({ transaction, isSelfOwner }) => {
  const { userAddress, localProvider } = useContext(AppContext);
  const { widthAboveMsTxDetailsFit } = useContext(LayoutContext);

  const { owners, confirmationsRequired: totalConfsNeeded, readContracts, writeContracts } = useContext(MsSafeContext);

  // CONFIRMATIONS

  const [confirmations, setConfirmations] = useState();
  const [currentNumConfirmations, setCurrentNumConfirmations] = useState();
  const updateConfirmations = async () => {
    const confProms = owners.map(o => readContracts.MultiSigSafe.isConfirmed(transaction.idx, o));
    const confs = await Promise.all(confProms);
    setConfirmations(confs);
    setCurrentNumConfirmations(confs.filter(c => c).length);
  };
  useEffect(() => updateConfirmations(), []);
  useOnBlock(localProvider, () => updateConfirmations());

  // POSSIBLE USER ACTIONS

  const canExecute =
    !transaction.executed &&
    currentNumConfirmations &&
    currentNumConfirmations.toString() === totalConfsNeeded.toString();
  const [canConfirm, setCanConfirm] = useState();
  const [canRevoke, setCanRevoke] = useState();

  const updateActions = async transaction => {
    const hasConfirmedSelf = !isSelfOwner
      ? false
      : await readContracts.MultiSigSafe.isConfirmed(transaction.idx, userAddress);

    if (!isSelfOwner || transaction.executed) {
      setCanConfirm(false);
      setCanRevoke(false);
      return;
    }

    if (canExecute) {
      setCanConfirm(false); // possible but not necessary, so don't allow
      setCanRevoke(hasConfirmedSelf);
      return;
    }

    // !canExecute
    if (hasConfirmedSelf) {
      setCanConfirm(false);
      setCanRevoke(true);
    } else {
      setCanConfirm(true);
      setCanRevoke(false);
    }
  };
  useEffect(() => updateActions(transaction), [transaction]);
  useOnBlock(localProvider, () => updateActions(transaction));

  const confsAvailable = currentNumConfirmations !== "undefined";

  const confirmationsItem = {
    label: "Confirmations",
    content: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          justifyContent: "flex-end",
          gap: "1rem",
        }}
      >
        <div
          style={{
            fontSize: "1rem",
            padding: "0 0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>
            {confsAvailable && (
              <span style={{ color: primaryColor, fontWeight: 500 }} className="mono-nice">
                {currentNumConfirmations}{" "}
              </span>
            )}
            {!confsAvailable && <Spin size="small"></Spin>}
            <span style={{ color: softTextColor }}>
              {" "}
              (requires <span className="mono-nice">{totalConfsNeeded}</span>){" "}
            </span>
          </div>
        </div>
      </div>
    ),
  };

  const ownersPart = (
    <div
      style={{
        flex: "1",
        minWidth: "21rem",
        maxHeight: "16rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        overflowY: "hidden",
        border: softBorder2,
        // background: swapGradient,
        background: cardGradient,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          height: "40px",
          minHeight: "40px",
          alignItems: "center",
          // fontSize: "1rem",
          padding: "0 2rem",
        }}
      >
        <div style={{ marginTop: "0.5rem" }}>Owner </div>
        <div style={{ marginTop: "0.5rem" }}>Confirmed</div>
      </div>
      <Divider style={{ marginTop: 0, marginBottom: "0.5rem" }} />
      <div style={{ flex: 1, overflow: "auto" }}>
        <Owners confirmations={confirmations} />
      </div>
    </div>
  );

  const actionsPart = (
    <div style={{ flex: "1", minWidth: "21rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Descriptions bordered size="small" style={{ width: "100%" }}>
        <Descriptions.Item label={<span style={labelStyle}>{confirmationsItem.label}</span>} span={6}>
          <div style={{ ...contentWrapperStyle }}>{confirmationsItem.content}</div>
        </Descriptions.Item>
      </Descriptions>
      {isSelfOwner && (
        <MSTransactionActions
          transaction={transaction}
          writeContracts={writeContracts}
          canConfirm={canConfirm}
          canExecute={canExecute}
          canRevoke={canRevoke}
        />
      )}
    </div>
  );

  const children = widthAboveMsTxDetailsFit ? [ownersPart, actionsPart] : [actionsPart, ownersPart];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      {children.map(c => c)}
    </div>
  );
};
export default MSTransactionDetails;
