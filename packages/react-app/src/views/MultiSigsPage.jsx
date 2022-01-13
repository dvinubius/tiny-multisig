import React, { useContext, useEffect } from "react";
import { CodeSandboxOutlined, LeftOutlined } from "@ant-design/icons";
import { Button, Divider, Spin, Typography } from "antd";
import { useState } from "react";
import CreateMultiSig from "../components/Factory/CreateMultiSig";
import { mainColWidthRem, mediumButtonMinWidth, softTextColor } from "../styles";
import StackGrid from "react-stack-grid";
import MSContractItem from "../components/Factory/MSContractItem";
import { AppContext, LayoutContext } from "../App";
import MultiSig from "../components/MultiSig/MultiSig";

const { Title } = Typography;

const MultiSigsPage = () => {
  const { injectableAbis, createdContracts, readContracts, userAddress } = useContext(AppContext);
  const { widthAboveMsTxDetailsFit } = useContext(LayoutContext);

  const [eventQueryExpired, setEventQueryExpired] = useState(false);
  useEffect(() => setTimeout(() => setEventQueryExpired(true), 5000), []); // if after this time no results, assume this user nas no owned safes

  const [initExpired, setInitExpired] = useState(false);
  useEffect(() => setTimeout(() => setInitExpired(true), 2500), []); // wait for userAddress to initialize

  const ownedContracts =
    userAddress && createdContracts && createdContracts.filter(contract => contract.owners.includes(userAddress)); // only mine
  const [openedContract, setOpenedContract] = useState();
  const handleOpenContract = c => {
    setOpenedContract(c);
  };

  const handleBack = () => setOpenedContract(null);

  const readyAll = ownedContracts && readContracts;

  if (!readyAll)
    return (
      <div
        style={{
          height: "50vh",
          margin: "auto",
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        {initExpired && !userAddress && (
          <div
            style={{
              color: softTextColor,
              fontSize: "1.25rem",
            }}
          >
            Connect a wallet to view this page
          </div>
        )}
        {(userAddress || !initExpired) && <Spin size="large" />}
      </div>
    );

  return (
    <div
      style={{
        height: "100%",
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 0 0",
      }}
    >
      <div
        style={{
          alignSelf: "stretch",
          margin: "0 1rem",
          display: "flex",
          gap: "1rem",
          position: "relative",
        }}
      >
        <div style={{ width: "9rem", textAlign: "left" }}>
          {!openedContract && <CreateMultiSig />}
          {openedContract && (
            <Button onClick={handleBack} style={{ minWidth: mediumButtonMinWidth }} size="large">
              <LeftOutlined /> Back
            </Button>
          )}
        </div>
        <Title
          level={2}
          style={{
            fontWeight: 400,
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {<CodeSandboxOutlined />} {!openedContract && "My Safes"}
        </Title>
      </div>
      {/* NAVI */}
      <div style={{ width: "100%", padding: "0 1rem" }}>
        <Divider style={{ margin: openedContract ? "1rem 0 1rem" : "2rem 0 0" }} orientation={"center"}>
          {openedContract && (
            <Title
              level={2}
              style={{
                fontWeight: 400,
                height: "2rem",
                transform: "translateY(-3px)",
                color: softTextColor,
                margin: "0",
              }}
            >
              {openedContract.name}
            </Title>
          )}
        </Divider>
      </div>

      {/* CONTENT */}
      {!openedContract && ownedContracts && ownedContracts.length === 0 && (
        <div style={{ color: softTextColor, marginTop: "20vh", fontSize: "1.25rem" }}>
          {!eventQueryExpired && <Spin size="large"></Spin>}
          {eventQueryExpired && "Looks like you don't own any safes yet"}
        </div>
      )}
      {!openedContract && ownedContracts && ownedContracts.length > 0 && injectableAbis && (
        <div style={{ alignSelf: "stretch", flex: 1, overflowY: "auto", paddingTop: "2rem" }}>
          <div
            style={{
              maxWidth: widthAboveMsTxDetailsFit ? `${mainColWidthRem}rem` : "28rem",
              margin: "0 auto 8rem",
            }}
          >
            <StackGrid columnWidth="100%" gutterHeight={16}>
              {ownedContracts.map(c => (
                <div key={c.address}>
                  <MSContractItem openContract={handleOpenContract} contract={c} abi={injectableAbis.MultiSigSafe} />
                </div>
              ))}
            </StackGrid>
          </div>
        </div>
      )}
      {openedContract && injectableAbis && (
        <div style={{ alignSelf: "stretch", flex: 1, overflow: "hidden" }}>
          <MultiSig contract={openedContract} />
        </div>
      )}
    </div>
  );
};

export default MultiSigsPage;
