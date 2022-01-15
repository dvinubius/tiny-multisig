import { Button, Col, Menu, Row } from "antd";
import "antd/dist/antd.css";

import { useBalance, useContractLoader, useGasPrice, useOnBlock, useUserProviderAndSigner } from "eth-hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";

import React, { useCallback, useEffect, useState, createContext, useMemo } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { useStaticJsonRPC } from "./hooks";
import { Web3ModalSetup } from "./helpers";
import { loadNonDeployedContractAbi } from "./helpers/loadNonDeployedAbis";

import "./App.css";
import { Faucet, GasGauge, Header, Ramp, FaucetHint, NetworkSwitch } from "./components";
import { Transactor } from "./helpers";
import CustomNetworkDisplay from "./components/CustomKit/CustomNetworkDisplay";
import { NETWORKS, ALCHEMY_KEY } from "./constants";

// contracts
import externalContracts from "./contracts/external_contracts";
import deployedContracts from "./contracts/hardhat_contracts.json";
import MultiSigsPage from "./views/MultiSigsPage";
import DebugUI from "./views/DebugUI";
import CustomAccount from "./components/CustomKit/CustomAccount";
import CustomHeader from "./components/CustomKit/CustomHeader";
import {
  breakPointMsFit,
  breakPointMsTxDetailsFit,
  breakPointUserStatusDisplayFit,
  softTextColor,
  swapGradient,
} from "./styles";
import { useWindowWidth } from "@react-hook/window-size";
import SingleMultiSigPage from "./views/SingleMultiSigPage";

const { ethers } = require("ethers");

/// 📡 What chain are your contracts deployed to?
const defaultTargetNetwork = NETWORKS.rinkeby; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

export const AppContext = createContext({});
export const LayoutContext = createContext({});

const App = props => {
  const windowWidth = useWindowWidth();

  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = ["localhost", "mainnet", "rinkeby"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const selectedNetworkOption = networkOptions.includes(defaultTargetNetwork.name)
    ? defaultTargetNetwork.name
    : networkOptions[0];
  const [selectedNetwork, setSelectedNetwork] = useState(selectedNetworkOption);

  /// 📡 What chain are your contracts deployed to?
  const targetNetwork = NETWORKS[selectedNetwork]; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);

  // 🛰 providers
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  // const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  // USE THIS INSTEAD if you want to avoid burner wallet and force the user to connect a wallet
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  let yourLocalBalance;
  try {
    // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
    yourLocalBalance = useBalance(localProvider, address);
  } catch (e) {
    // just in order to keep the react app from crashing
    console.log(e);
  }

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  // const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  const factoryAddress = readContracts && readContracts.MSFactory && readContracts.MSFactory.address;

  // CREATED CONTRACTS

  // ** 📟 Listen for broadcast events
  const createMultiSigSafeEvents = useEventListener(readContracts, "MSFactory", "CreateMultiSigSafe", localProvider, 1);
  console.log("📟 CreateMultiSigSafe events:", createMultiSigSafeEvents);

  const [createdContracts, setCreatedContracts] = useState();
  useEffect(() => {
    if (!createdContracts || createdContracts.length !== createMultiSigSafeEvents.length) {
      setCreatedContracts(
        createMultiSigSafeEvents
          .map(event => ({
            idx: event.args.contractId.toNumber(),
            address: event.args.contractAddress,
            name: event.args.name,
            time: new Date(event.args.timestamp.toNumber() * 1000),
            creator: event.args.creator,
            owners: event.args.owners,
            confirmationsRequired: event.args.confirmationsRequired.toNumber(),
            // add any other available args here
          }))
          .reverse(), // most recent first
      );
    }
  }, [createMultiSigSafeEvents, address]);

  const [numCreated, setNumCreated] = useState();
  useEffect(() => {
    if (typeof numCreated === "undefined" && readContracts && readContracts.MSFactory) {
      readContracts.MSFactory.numberOfContracts().then(n => setNumCreated(n));
    }
  }, [readContracts]);

  const [injectableAbis, setInjectableAbis] = useState();
  useEffect(() => {
    const load = async () => {
      const MultiSigSafe = await loadNonDeployedContractAbi("MultiSigSafe");
      setInjectableAbis({ MultiSigSafe });
    };
    load();
  }, [setInjectableAbis]);

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      yourMainnetBalance &&
      readContracts &&
      writeContracts
      // mainnetContracts
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");
      console.log("📝 readContracts", readContracts);
      // console.log("🌍 DAI contract on mainnet:", mainnetContracts);
      // console.log("💵 yourMainnetDAIBalance", myMainnetDAIBalance);
      console.log("🔐 writeContracts", writeContracts);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    yourMainnetBalance,
    readContracts,
    writeContracts,
    // mainnetContracts,
  ]);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  const appContext = {
    factoryAddress,
    injectableAbis,
    createdContracts,
    contractConfig,
    readContracts,
    writeContracts,
    userAddress: address,
    tx,
    userEthBalance: yourLocalBalance,
    localProvider,
    mainnetProvider,
    gasPrice,
    userSigner,
    localChainId,
    price,
    DEBUG,
    blockExplorer,
    numCreatedContracts: numCreated,
  };

  const layoutContext = {
    windowWidth,
    widthAboveMsFit: windowWidth >= breakPointMsFit,
    widthAboveMsTxDetailsFit: windowWidth >= breakPointMsTxDetailsFit,
    widthAboveUserStatusDisplayFit: windowWidth >= breakPointUserStatusDisplayFit,
  };
  return (
    <LayoutContext.Provider value={layoutContext}>
      <AppContext.Provider value={appContext}>
        <div className="App">
          <BrowserRouter>
            <div
              style={{
                width: "fit-content",
                borderRight: "1px solid #efefef",
                borderBottom: "1px solid #efefef",
                background: swapGradient,
              }}
            >
              <Link to="/">
                <CustomHeader />
              </Link>
            </div>

            <Link to="/contracts">
              <Button
                type="default"
                style={{
                  position: "absolute",
                  bottom: "1rem",
                  right: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.8,
                  boxShadow: "0 3px 5px 1px #eaeaea",
                  zIndex: 10,
                }}
              >
                <div style={{ fontSize: "1rem", color: softTextColor }}>
                  <span style={{ marginRight: "0.75rem", fontSize: "0.875rem" }}>🛠</span>Debug
                </div>
              </Button>
            </Link>

            <div className="AppScroller">
              <Routes>
                <Route
                  path="/mysafes/:idx"
                  element={
                    <div className="AppCenteredCol">
                      <MultiSigsPage />
                    </div>
                  }
                />
                <Route
                  path="/mysafes"
                  element={
                    <div className="AppCenteredCol">
                      <MultiSigsPage />
                    </div>
                  }
                />
                <Route path="/" element={<Navigate replace to="/mysafes" />} />
                <Route path="/safe/:idx" element={<SingleMultiSigPage />} />
                <Route
                  path="/contracts"
                  element={
                    <div className="AppCenteredCol">
                      <DebugUI factoryName="MSFactory" createdContractName="MultiSigSafe" />
                    </div>
                  }
                />
              </Routes>
            </div>
          </BrowserRouter>

          {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
          <div
            style={{
              position: "fixed",
              textAlign: "right",
              right: 0,
              top: 0,
              padding: "0.5rem 1rem",
              height: 55,
            }}
            className="hud hudTop"
          >
            <div style={{ display: "flex", flex: 1, gap: "1rem", alignItems: "center" }}>
              <div>
                <NetworkSwitch
                  networkOptions={networkOptions}
                  selectedNetwork={selectedNetwork}
                  setSelectedNetwork={setSelectedNetwork}
                />
              </div>
              <CustomAccount
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
                connectedNetworkDisplay={
                  injectedProvider && (
                    <CustomNetworkDisplay
                      NETWORKCHECK={NETWORKCHECK}
                      localChainId={localChainId}
                      selectedChainId={selectedChainId}
                      targetNetwork={targetNetwork}
                      logoutOfWeb3Modal={logoutOfWeb3Modal}
                    />
                  )
                }
              />
            </div>
            <div style={{ position: "absolute", right: "6.4rem" }}>
              {userSigner && (
                <FaucetHint localProvider={localProvider} targetNetwork={targetNetwork} address={address} />
              )}
            </div>
          </div>

          {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
          <div
            style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}
            className="hud hudBottom"
          >
            <Row align="middle" gutter={[4, 4]}>
              <Col span={8}>
                <Ramp price={price} address={address} networks={NETWORKS} />
              </Col>

              <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
                <GasGauge gasPrice={gasPrice} />
              </Col>
              <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
                <Button
                  onClick={() => {
                    window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
                  }}
                  size="large"
                  shape="round"
                >
                  <span style={{ marginRight: 8 }} role="img" aria-label="support">
                    💬
                  </span>
                  Support
                </Button>
              </Col>
            </Row>

            <Row align="middle" gutter={[4, 4]}>
              <Col span={24}>
                {
                  /*  if the local provider has a signer, let's show the faucet:  */
                  faucetAvailable ? (
                    <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
                  ) : (
                    ""
                  )
                }
              </Col>
            </Row>
          </div>
        </div>
      </AppContext.Provider>
    </LayoutContext.Provider>
  );
};

export default App;
