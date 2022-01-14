import { Card, Divider, Spin, Tabs, Descriptions } from "antd";
import { useBalance, useContractLoader } from "eth-hooks";
import "./MultiSig.css";
import React, { useContext, useEffect, useState, createContext } from "react";
import {
  breakPointMsTxDetailsFit,
  cardGradient,
  softBorder,
  mainColWidthRem,
  softBorder2,
  primaryColor,
  cardGradientVert,
  breakPointMsFit,
  msSafeColWidthRem,
  msSafeColGapRem,
} from "../../styles";
import CustomAddress from "../CustomKit/CustomAddress";
import { getContractConfigWithInjected } from "../../helpers/getContractConfigWithInjected";
import { AppContext, LayoutContext } from "../../App";
import QR from "qrcode.react";
import { useMultiSigTransactions } from "./useMultiSigTransactions";
import Owners from "./Owners";
import CustomBalance from "../CustomKit/CustomBalance";
import Requirements from "./Requirements";
import MSTransactionsSection from "./MSTransactionsSection";
import UserStatus from "../Shared/UserStatus";

export const MsSafeContext = createContext({});

const MultiSig = ({ contract }) => {
  const { injectableAbis, localProvider, injectedProvider, userSigner, localChainId, userAddress } =
    useContext(AppContext);

  const contractConfig = getContractConfigWithInjected(
    "MultiSigSafe",
    injectableAbis.MultiSigSafe,
    contract.address,
    localChainId,
  );

  const readContracts = useContractLoader(localProvider, contractConfig);

  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  const { transactions: multiSigTxs, initializing: initializingTxs } = useMultiSigTransactions(
    localProvider,
    readContracts,
  );

  const owners = contract.owners;
  const confirmationsRequired = contract.confirmationsRequired;
  const balance = useBalance(localProvider, contract.address);

  const isSelfOwnerOfContract = contract && userAddress && contract.owners.includes(userAddress);
  const isSelfCreatorOfContract = contract && contract.creator === userAddress;
  const uncertain = injectedProvider ? !(contract && userAddress) : !contract;
  const userStatusDisplay = !uncertain && (
    <UserStatus isSelfCreator={isSelfCreatorOfContract} isSelfOwner={isSelfOwnerOfContract} idx={contract.idx} />
  );

  const msWalletContext = {
    contract,
    readContracts,
    writeContracts,
    owners,
    confirmationsRequired,
    msTransactions: multiSigTxs,
    balance,
  };

  const ready =
    contract && readContracts && writeContracts && owners && confirmationsRequired && !initializingTxs && multiSigTxs;

  return ready ? (
    <MsSafeContext.Provider value={msWalletContext}>
      <MultiSigDisplay balance={balance} userStatusDisplay={userStatusDisplay} />
    </MsSafeContext.Provider>
  ) : (
    <div style={{ margin: "auto", display: "flex", alignItems: "center", justifyContent: "center", height: "30vh" }}>
      <Spin size="large" />
    </div>
  );
};

const MultiSigDisplay = ({ balance, userStatusDisplay }) => {
  const { price } = useContext(AppContext);
  const { contract, readContracts, owners, confirmationsRequired } = useContext(MsSafeContext);
  const { widthAboveMsTxDetailsFit, widthAboveUserStatusDisplayFit } = useContext(LayoutContext);
  const labelStyle = {
    fontSize: "0.875rem",
    color: "hsl(0, 0%, 40%)",
    flexShrink: 0,
    color: "#111111",
  };
  const balanceWrapperStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    height: "1.875rem",
    alignItems: "center",
  };

  return (
    <div style={{ maxWidth: "100%", height: "100%" }} className="MultiSig">
      <div
        style={{
          margin: "0 auto",
          height: "100%",
          overflow: "auto",
          background: cardGradientVert,
          padding: "1rem 1rem 6rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", marginTop: "1rem" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: widthAboveUserStatusDisplayFit ? `${msSafeColWidthRem * 2 + msSafeColGapRem}rem` : "100%",
                margin: "0 auto 2rem",
              }}
            >
              {userStatusDisplay}
            </div>
            <div
              style={{
                display: "flex",
                gap: `${msSafeColGapRem}rem`,
                flexWrap: "wrap",
                justifyContent: "center",
                padding: "0 0 2rem",
              }}
              className="WalletOverview"
            >
              <div
                style={{
                  width: `${msSafeColWidthRem}rem`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: "1rem",
                }}
              >
                <Descriptions bordered size="small" style={{ width: "100%" }}>
                  <Descriptions.Item label={<span style={labelStyle}>{"Balance"}</span>} span={6}>
                    <div style={{ ...balanceWrapperStyle, opacity: 0.8 }}>
                      <CustomBalance
                        balance={balance}
                        size="1.25rem"
                        etherMode
                        padding={0}
                        customColor={primaryColor}
                        price={price}
                      />
                    </div>
                  </Descriptions.Item>
                </Descriptions>

                <div
                  style={{
                    height: 38,
                    border: softBorder,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CustomAddress fontSize={18} value={contract.address} />
                </div>

                <div
                  style={{
                    // flex: 1,
                    alignSelf: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: softBorder,
                  }}
                >
                  <QR
                    value={readContracts ? contract.address : ""}
                    size={180}
                    level="H"
                    includeMargin
                    renderAs="svg"
                    imageSettings={{ excavate: false }}
                  />
                </div>
              </div>
              <div
                style={{
                  width: `${msSafeColWidthRem}rem`,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: "1rem",
                }}
              >
                <Descriptions bordered size="small" style={{ width: "100%" }}>
                  <Descriptions.Item
                    label={<div style={{ ...labelStyle, width: "6rem" }}>{"Confirmations"}</div>}
                    span={6}
                  >
                    <div style={{ ...balanceWrapperStyle, justifyContent: "center" }}>
                      <Requirements confirmations={confirmationsRequired} />
                    </div>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions bordered size="small" style={{ width: "100%" }}>
                  <Descriptions.Item label={<div style={{ ...labelStyle, width: "6rem" }}>{"Owners"}</div>} span={6}>
                    <div
                      style={{ ...balanceWrapperStyle, justifyContent: "flex-end", fontSize: "1rem" }}
                      className="mono-nice"
                    >
                      {owners.length}
                    </div>
                  </Descriptions.Item>
                </Descriptions>

                <div
                  style={{
                    flex: 1,
                    maxHeight: "16rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: "center",
                    border: softBorder2,
                    // background: swapGradient,
                    background: cardGradient,
                    padding: "0.5rem 0",
                  }}
                >
                  <div style={{ height: "100%" }}>
                    <Owners />
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                width: widthAboveMsTxDetailsFit ? `${mainColWidthRem}rem` : "100%",
                margin: "auto",
              }}
            >
              <Divider>TRANSACTIONS</Divider>
            </div>
            <MSTransactionsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSig;
