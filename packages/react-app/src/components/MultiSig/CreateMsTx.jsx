import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Spin } from "antd";
import React, { useContext, useState } from "react";
import CustomEtherInput from "../CustomKit/CustomEtherInput";
import { AppContext } from "../../App";
import { Transactor } from "../../helpers";
import CustomAddressInput from "../CustomKit/CustomAddressInput";
import Asterisk from "../Shared/Asterisk";
import CreateModalFooter from "../Shared/CreateModalFooter";
import CreateModalSentOverlay from "../Shared/CreateModalSentOverlay";
import "./CreateMsTx.css";
import BytesInput from "../CustomKit/BytesInput";
const { ethers } = require("ethers");
import { MsSafeContext } from "./MultiSig";

const CreateMsTx = () => {
  const { writeContracts } = useContext(MsSafeContext);
  const { userSigner, gasPrice, price } = useContext(AppContext);
  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  const [visibleModal, setVisibleModal] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [txSent, setTxSent] = useState(false);
  const [txError, setTxError] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);

  const resetMeself = () => {
    setPendingCreate(false);
    setTxSent(false);
    setTxError(false);
    setTxSuccess(false);
    form.resetFields();
  };

  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setPendingCreate(true);
      const to = form.getFieldValue("to");
      const value = ethers.utils.parseEther(form.getFieldValue("value"));
      const data = form.getFieldValue("data") ?? "0x";
      const transaction = writeContracts.MultiSigSafe.submitTransaction(to, value, data);
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

  const formSize = "medium";
  const labelWidthRem = 5;
  const inputWidthRem = 18;
  const labelFontSize = "0.875rem";

  return (
    <div>
      <Button type="primary" size="large" onClick={() => setVisibleModal(true)} style={{ width: "7rem" }}>
        <PlusOutlined />
        New
      </Button>

      <Modal
        destroyOnClose={true}
        title="Create a MultiSig Transaction"
        style={{ top: 120 }}
        width="30rem"
        visible={visibleModal}
        onOk={handleSubmit}
        onCancel={handleCancel}
        footer={
          <CreateModalFooter
            txSent={txSent}
            txError={txError}
            txSuccess={txSuccess}
            pendingCreate={pendingCreate}
            handleCancel={handleCancel}
            handleRetry={handleRetry}
            handleSubmit={handleSubmit}
          />
        }
      >
        {txSent && (
          <CreateModalSentOverlay
            txError={txError}
            txSuccess={txSuccess}
            pendingText="Creating Transaction"
            successText="Transaction Created!"
            errorText="Failed"
          />
        )}
        <Form
          size={formSize}
          form={form}
          style={{
            pointerEvents: txSent ? "none" : "all",
          }}
          className="CreateMsTx"
        >
          <Form.Item
            label={
              <span style={{ fontSize: labelFontSize, width: `${labelWidthRem}rem` }}>
                To
                <Asterisk />
              </span>
            }
            name="to"
            rules={[
              { required: true, message: "Please input a recipient" },
              {
                validator: (_, value) =>
                  ethers.utils.isAddress(value) ? Promise.resolve() : Promise.reject(new Error("Bad format")),
              },
            ]}
          >
            <CustomAddressInput
              placeholder="Enter recipient"
              value={form.getFieldValue("to")}
              wrapperStyle={{ width: `${inputWidthRem}rem` }}
            />
          </Form.Item>

          <Form.Item
            label={
              <span style={{ fontSize: labelFontSize, width: `${labelWidthRem}rem` }}>
                Value
                <Asterisk />
              </span>
            }
            name="value"
            rules={[{ required: true, message: "Please enter a value" }]}
          >
            <CustomEtherInput
              etherMode
              price={price}
              wrapperStyle={{ width: `${inputWidthRem}rem` }}
              placeholder="Enter value"
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontSize: labelFontSize, width: `${labelWidthRem}rem` }}>Data 0x</span>}
            name="data"
            rules={[
              {
                validator: (_, value) => {
                  if (!value || value.length <= 2) {
                    return Promise.resolve();
                  }

                  let noPrefix = value.toString().substr(2);
                  if (noPrefix.length % 2 !== 0) {
                    return Promise.reject(new Error("Bad format - odd number of characters"));
                  }

                  const regexp = /^[0-9a-fA-F]+$/;
                  if (regexp.test(noPrefix)) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject(new Error("Bad format - invalid characters"));
                  }
                },
              },
            ]}
          >
            <BytesInput
              type="text"
              wrapperStyle={{ width: `${inputWidthRem}rem`, fontSize: "0.75rem" }}
              placeholder="Enter transaction data"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateMsTx;
