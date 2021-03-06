import React from "react";
import CustomAddress from "../CustomKit/CustomAddress";

const ContractDebugHeader = ({ contract, hoverable }) => {
  return (
    <div
      style={{
        width: "100%",
        minWidth: "32rem",
        maxWidth: "70vw",
        margin: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem",
      }}
      className={hoverable ? "DebugHeader hoverableDebugHeader" : "DebugHeader"}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          flexDirection: "column",
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: 500, marginRight: "1rem" }}>{`${contract.name}`}</div>
        <div>
          <span>created</span> <span style={{ fontWeight: 500 }}>{contract.time.toLocaleString()}</span>
        </div>
      </div>
      <div
        style={{
          width: "14rem",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "1rem",
          fontSize: "1rem",
        }}
      >
        by
        <CustomAddress value={contract.creator} fontSize={20} />
      </div>
    </div>
  );
};

export default ContractDebugHeader;
