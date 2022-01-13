import { Tabs } from "antd";
import React, { useContext } from "react";
import { AppContext, LayoutContext } from "../../App";
import { breakPointMsFit, mainColWidthRem, softTextColor } from "../../styles";
import CreateMsTx from "./CreateMsTx";
import { MsSafeContext } from "./MultiSig";
import TransactionListItem from "./TransactionListItem";

const { TabPane } = Tabs;
const MSTransactionsSection = () => {
  const { userAddress } = useContext(AppContext);
  const { owners, msTransactions } = useContext(MsSafeContext);
  const { widthAboveMsFit } = useContext(LayoutContext);

  const isSelfOwner = owners && owners.includes(userAddress);

  const emptyStateTxs = text => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "10rem",
        fontSize: "1rem",
        color: softTextColor,
      }}
    >
      {text}
    </div>
  );
  return (
    <div
      style={{
        position: "relative",
        width: widthAboveMsFit ? `${mainColWidthRem}rem` : "100%",
        margin: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          position: "relative",
          top: "0.5rem",
        }}
      >
        {isSelfOwner && <CreateMsTx />}
      </div>
      <Tabs defaultActiveKey="1" size="small" centered>
        <TabPane tab={<span style={{ letterSpacing: "0.1rem", margin: "0 3rem" }}>Pending</span>} key="1">
          {msTransactions.pending.length === 0 && emptyStateTxs("No pending transactions")}
          {msTransactions.pending.map(tx => (
            <TransactionListItem transaction={tx} key={tx.idx} />
          ))}
        </TabPane>
        <TabPane tab={<span style={{ letterSpacing: "0.1rem", margin: "0 3rem" }}>Executed</span>} key="2">
          {msTransactions.executed.length === 0 && emptyStateTxs("No executed transactions")}
          {msTransactions.executed.map(tx => (
            <TransactionListItem transaction={tx} key={tx.idx} />
          ))}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MSTransactionsSection;
