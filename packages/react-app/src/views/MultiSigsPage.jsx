import React, { useCallback, useContext, useEffect } from "react";
import { CodeSandboxOutlined, HomeOutlined, LeftOutlined } from "@ant-design/icons";
import { Button, Divider, Spin, Typography } from "antd";
import { useState } from "react";
import CreateMultiSig from "../components/Factory/CreateMultiSig";
import { mainColWidthRem, mediumButtonMinWidth, softTextColor } from "../styles";
import StackGrid from "react-stack-grid";
import MSContractItem from "../components/Factory/MSContractItem";
import { AppContext, LayoutContext } from "../App";
import MultiSig from "../components/MultiSig/MultiSig";
import NaviMultiSigs from "./NaviMultiSigs";
import { useNavigate, useParams } from "react-router-dom";

const { Title } = Typography;

const MultiSigsPage = () => {
  const { injectableAbis, createdContracts, readContracts, userAddress } = useContext(AppContext);
  const { widthAboveMsTxDetailsFit } = useContext(LayoutContext);

  const navigate = useNavigate();
  const { idx } = useParams();
  const chosenContractMode = typeof idx !== "undefined";

  const [displayBack, setDisplayBack] = useState(false);

  const [eventQueryExpired, setEventQueryExpired] = useState(false);
  useEffect(() => setTimeout(() => setEventQueryExpired(true), 6500), []); // if after this time no results, assume this user nas no owned vaults

  const [userAddressInitExpired, setUserAddressInitExpired] = useState(false);
  useEffect(() => setTimeout(() => setUserAddressInitExpired(true), 2500), []); // wait for userAddress to initialize

  const isMine = c => c.owners.includes(userAddress) || c.creator === userAddress;

  const canGetData = chosenContractMode
    ? idx && createdContracts && userAddress && injectableAbis
    : createdContracts && injectableAbis && userAddress && readContracts;

  // just the chosen contract
  const identifiedParamContract =
    chosenContractMode && canGetData && createdContracts.find(c => c.idx.toString() === idx);

  // all owned or created ones
  const myContracts = !chosenContractMode && canGetData && createdContracts.filter(isMine);

  const handleOpenContract = useCallback(c => {
    setDisplayBack(true);
    navigate(`/myvaults/${c.idx}`);
  });

  const handleBack = () => {
    navigate(-1);
  };

  if (!canGetData) {
    // DISPLAY LOADING STATE / EMPTY STATE WITHOUT NAVI SHELL
    const showNoUserDisplay = userAddressInitExpired && !userAddress;
    return (
      <div
        style={{
          height: "50vh",
          margin: "auto",
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        {showNoUserDisplay && (
          <div
            style={{
              color: softTextColor,
              fontSize: "1.25rem",
            }}
          >
            Connect a wallet to view this page
          </div>
        )}
        {!showNoUserDisplay && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Spin size="large" />
            <div style={{ color: softTextColor, fontSize: "1.25rem" }}>Connecting...</div>
          </div>
        )}
      </div>
    );
  }

  // BUILD SHELL

  const naviItems = chosenContractMode ? (
    <div style={{ width: "9rem", textAlign: "left" }}>
      {displayBack && (
        <Button onClick={handleBack} style={{ minWidth: mediumButtonMinWidth }} size="large">
          <LeftOutlined /> Back
        </Button>
      )}
      {!displayBack && (
        <Button style={{ minWidth: mediumButtonMinWidth }} size="large" onClick={() => navigate("/")}>
          <HomeOutlined />
          My Vaults
        </Button>
      )}
    </div>
  ) : (
    <div style={{ width: "9rem", textAlign: "left" }}>
      <CreateMultiSig />
    </div>
  );

  const pageTitle = chosenContractMode ? (
    <CodeSandboxOutlined />
  ) : (
    <>
      <CodeSandboxOutlined /> My Vaults
    </>
  );

  const viewDivider = (
    <Divider style={{ margin: identifiedParamContract ? "1rem 0 1rem" : "2rem 0 0" }}>
      {identifiedParamContract && (
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
          {identifiedParamContract.name}
        </Title>
      )}
    </Divider>
  );

  const hasData = chosenContractMode ? identifiedParamContract : myContracts.length;

  let viewContent;
  if (!hasData) {
    // EMPTY STATE
    viewContent = (
      <div style={{ color: softTextColor, marginTop: "20vh", fontSize: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {!eventQueryExpired && (
            <>
              <Spin size="large" />
              <div style={{ color: softTextColor, fontSize: "1.25rem" }}>
                {chosenContractMode ? "Connecting to your vault..." : "Retrieving your vaults..."}
              </div>
            </>
          )}

          {eventQueryExpired && (
            <div style={{ color: softTextColor, fontSize: "1.25rem" }}>
              {chosenContractMode
                ? "Could not find this vault among your own"
                : "Looks like you don't own any vaults yet"}
            </div>
          )}
        </div>
      </div>
    );
  } else {
    // PROPER CONTENT
    viewContent = chosenContractMode ? (
      <div style={{ alignSelf: "stretch", flex: 1, overflow: "hidden" }}>
        <MultiSig contract={identifiedParamContract} />
      </div>
    ) : (
      <div style={{ alignSelf: "stretch", flex: 1, overflowY: "auto", paddingTop: "2rem" }}>
        <div
          style={{
            maxWidth: widthAboveMsTxDetailsFit ? `${mainColWidthRem}rem` : "28rem",
            margin: "0 auto 8rem",
          }}
        >
          <StackGrid columnWidth="100%" gutterHeight={16}>
            {myContracts.map(c => (
              <div key={c.address}>
                <MSContractItem openContract={handleOpenContract} contract={c} abi={injectableAbis.MultiSigVault} />
              </div>
            ))}
          </StackGrid>
        </div>
      </div>
    );
  }

  return (
    <NaviMultiSigs naviItems={naviItems} pageTitle={pageTitle} viewDivider={viewDivider} viewContent={viewContent} />
  );
};

export default MultiSigsPage;
