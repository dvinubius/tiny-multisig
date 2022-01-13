import { Descriptions, Spin } from "antd";
import React, { useContext } from "react";
import { AppContext } from "../../App";
import { primaryColor } from "../../styles";
import CustomAddress from "../CustomKit/CustomAddress";
import CustomBalance from "../CustomKit/CustomBalance";
import TxData from "../CustomKit/TxData";
import { contentWrapperStyle, labelStyle } from "./MSTransactionStyles";

const MSTransactionOverview = ({ transaction }) => {
  const { mainnetProvider, blockExplorer, price } = useContext(AppContext);

  const operationDetails = [
    {
      label: "Recipient",
      content: (
        <CustomAddress
          address={transaction.to}
          ensProvider={mainnetProvider}
          blockExplorer={blockExplorer}
          fontSize={16}
        />
      ),
    },
    {
      label: "Value",
      content: (
        <CustomBalance
          balance={transaction.value}
          etherMode
          size="1rem"
          padding={0}
          price={price}
          customColor={primaryColor}
        />
      ),
    },
  ];
  if (transaction.data !== "0x") {
    operationDetails.splice(2, 0, {
      label: "Data",
      content: <TxData data={transaction.data} fontSize="0.875rem" width="12rem" iconFontSize="1rem" />,
    });
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          flex: "1",
          minWidth: "21rem",
        }}
      >
        <Descriptions bordered size="small" style={{ width: "100%" }}>
          {[
            {
              label: "Creator",
              content: (
                <CustomAddress
                  address={transaction.owner}
                  ensProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  fontSize={16}
                />
              ),
            },
            {
              label: "Submitted",
              content: (
                <div style={{}} className="mono-nice">
                  {transaction.dateSubmitted.toLocaleString()}
                </div>
              ),
            },
          ].map(item => (
            <Descriptions.Item label={<span style={labelStyle}>{item.label}</span>} span={6}>
              <div style={{ ...contentWrapperStyle }}>{item.content}</div>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>

      <div
        style={{
          flex: "1",
          minWidth: "21rem",
        }}
      >
        <Descriptions bordered size="small" style={{ width: "100%" }}>
          {operationDetails.map(item => (
            <Descriptions.Item label={<span style={labelStyle}>{item.label}</span>} span={6}>
              <div style={{ ...contentWrapperStyle }}>{item.content}</div>
            </Descriptions.Item>
          ))}
        </Descriptions>

        {transaction.executed && (
          <Descriptions bordered size="small" style={{ width: "100%", marginTop: "1rem" }}>
            <Descriptions.Item label={<span style={labelStyle}>Executed</span>} span={6}>
              <div style={{ ...contentWrapperStyle }} className="mono-nice">
                {transaction.dateExecuted ? (
                  <div>{transaction.dateExecuted.toLocaleString()}</div>
                ) : (
                  <Spin size="small" />
                )}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </div>
    </div>
  );
};

export default MSTransactionOverview;
