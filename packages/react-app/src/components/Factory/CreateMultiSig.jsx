import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Input, Modal, Spin } from "antd";
import { useContractLoader } from "eth-hooks";
import React, { useContext, useState } from "react";
import { AppContext } from "../../App";
import { Transactor } from "../../helpers";
import CustomAddressInput from "../CustomKit/CustomAddressInput";
import IntegerStep from "./IntegerStep";
import Asterisk from "../Shared/Asterisk";
import FormError from "../Shared/FormError";
import CreateModalFooter from "../Shared/CreateModalFooter";
import CreateModalSentOverlay from "../Shared/CreateModalSentOverlay";
const { ethers } = require("ethers");

const CreateMultiSig = () => {
  const { userSigner, gasPrice, contractConfig, localChainId } = useContext(AppContext);
  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);
  const [visibleModal, setVisibleModal] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [txSent, setTxSent] = useState(false);
  const [txError, setTxError] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);

  const [name, setName] = useState("");
  const [owners, setOwners] = useState(["", ""]);
  const [numConfs, setNumConfs] = useState(1);

  const [nameError, setNameError] = useState("");
  const [ownersErrors, setOwnersErrors] = useState(["", ""]);

  const validateFields = () => {
    let ret = true;
    if (!name) {
      setNameError("Please input a name");
      ret = false;
    }
    const newOwnersErrors = [...ownersErrors.map(e => "")]; // reset all
    owners.forEach((owner, idx) => {
      let err;
      if (!owner) {
        err = "Required Input";
      } else if (owners.slice(0, idx).some(o => o === owner)) {
        err = "Duplicate Owner";
      } else if (!ethers.utils.isAddress(owner)) {
        err = "Bad format";
      }

      if (err) {
        newOwnersErrors.splice(idx, 1, err);
        setOwnersErrors(newOwnersErrors);
        ret = false;
      }
    });
    return ret;
  };

  const updateName = ev => {
    setName(ev.target.value);
    if (ev.target.value) {
      setNameError("");
    }
  };

  const addOwnerField = () => {
    const newOwners = [...owners, ""];
    setOwners(newOwners);
    setOwnersErrors(newOwners.map(o => ""));
  };

  const removeOwnerField = idx => {
    const newOwners = [...owners];
    newOwners.splice(idx, 1);
    setOwners(newOwners);
    setOwnersErrors(newOwners.map(o => ""));
  };

  const updateOwner = (value, idx) => {
    const newOwners = [...owners];
    newOwners[idx] = value;
    setOwners(newOwners);
    const newOwnersErrors = [...ownersErrors];
    newOwnersErrors.splice(idx, 1, "");
    setOwnersErrors(newOwnersErrors);
  };

  const resetMeself = () => {
    setPendingCreate(false);
    setTxSent(false);
    setTxError(false);
    setTxSuccess(false);
    setName("");
    setNameError("");
    setOwners(["", ""]);
    setOwnersErrors(["", ""]);
    setNumConfs(undefined);
  };

  const handleSubmit = async () => {
    try {
      const canGo = validateFields();

      if (!canGo) {
        return;
      }
      setPendingCreate(true);
      const transaction = writeContracts.MSFactory.createMultiSigSafe(name, owners, numConfs);
      setTxError(false);
      tx(transaction, update => {
        if (update && (update.error || update.reason)) {
          setPendingCreate(false);
          setTxError(true);
        }
        if (update && (update.status === "confirmed" || update.status === 1)) {
          setPendingCreate(false);
          setTxSuccess(true);
        }
        if (update && update.code) {
          // metamask error
          // may be that user denied transaction, but also actual errors
          // handle them particularly if you need to
          // https://github.com/MetaMask/eth-rpc-errors/blob/main/src/error-constants.ts
          setPendingCreate(false);
          setTxSent(false);
        }
      });
      setTxSent(true);
    } catch (e) {
      // error messages will appear in form
      console.log("SUBMIT FAILED: ", e);
    }
  };

  const handleCancel = () => {
    setVisibleModal(false);
    resetMeself();
  };

  const handleRetry = () => {
    setTxError(false);
    setTxSent(false);
  };

  const labelWidthRem = 5;
  const inputWidthRem = 18;
  const labelFontSize = "0.875rem";

  const modalFooter = (
    <CreateModalFooter
      txSent={txSent}
      txError={txError}
      txSuccess={txSuccess}
      pendingCreate={pendingCreate}
      handleCancel={handleCancel}
      handleRetry={handleRetry}
      handleSubmit={handleSubmit}
    />
  );

  return (
    <div>
      <Button type="primary" size="large" onClick={() => setVisibleModal(true)}>
        <PlusOutlined />
        Create Safe
      </Button>

      <Modal
        destroyOnClose={true}
        title="Create MultiSig Safe"
        style={{ top: 120 }}
        visible={visibleModal}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width="30rem"
        footer={modalFooter}
      >
        {txSent && (
          <CreateModalSentOverlay
            txError={txError}
            txSuccess={txSuccess}
            pendingText="Creating Safe"
            successText="MultiSig Safe Created"
            errorText="Transaction Failed"
          />
        )}
        <div
          style={{
            pointerEvents: txSent ? "none" : "all",
          }}
        >
          <div style={{ justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ fontSize: labelFontSize, width: `${labelWidthRem}rem`, textAlign: "right" }}>
              Name:
              <Asterisk />
            </div>
            <Input
              type="text"
              placeholder="Name your contract"
              style={{ width: `${inputWidthRem}rem` }}
              value={name}
              onChange={updateName}
            />
          </div>
          {nameError && (
            <div style={{ marginLeft: `${labelWidthRem + 1}rem` }}>
              <FormError text={nameError} />
            </div>
          )}

          <Divider orientation="left">Owners</Divider>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {owners.map((owner, idx) => (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ fontSize: labelFontSize, width: `${labelWidthRem}rem`, textAlign: "right" }}>
                    {`Owner ${idx + 1}:`}
                    <Asterisk />
                  </div>
                  <CustomAddressInput
                    placeholder={`Input address`}
                    address={owner}
                    onChange={v => updateOwner(v, idx)}
                    wrapperStyle={{ width: `${inputWidthRem}rem` }}
                  />
                  {idx > 1 && (
                    <Button style={{ padding: "0 0.5rem" }} danger onClick={() => removeOwnerField(idx)}>
                      <DeleteOutlined />
                    </Button>
                  )}
                </div>
                {ownersErrors[idx] && (
                  <div style={{ marginLeft: `${labelWidthRem + 1}rem` }}>
                    <FormError text={ownersErrors[idx]} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              width: `${labelWidthRem + inputWidthRem + 1}rem`,
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <Button size="medium" onClick={addOwnerField}>
              <PlusOutlined />
              Add
            </Button>
          </div>

          <Divider orientation="left">Confirmations</Divider>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignSelf: "stretch",
              paddingLeft: `${labelWidthRem + 1}rem`,
            }}
          >
            <IntegerStep mi={1} ma={owners.length} update={setNumConfs} sliderWidth={`13rem`} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateMultiSig;
