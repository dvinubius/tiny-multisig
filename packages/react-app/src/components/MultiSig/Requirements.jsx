import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import React, { useContext } from "react";
import { softTextColor } from "../../styles";
import { MsSafeContext } from "./MultiSig";

const Requirements = () => {
  const { owners, confirmationsRequired: confirmations } = useContext(MsSafeContext);
  const requirementHelp = owners && confirmations && (
    <div
      style={{
        position: "absolute",
        left: "0rem",
      }}
    >
      <Tooltip
        title={`${confirmations} out of the ${owners.length} owners must confirm before a submitted transaction can be executed`}
        overlayInnerStyle={{
          width: "22rem",
          backgroundColor: "white",
          color: "#111",
          opacity: 0.9,
        }}
      >
        <QuestionCircleOutlined style={{ fontSize: "0.875rem", flexGrow: 1, color: softTextColor }} />
      </Tooltip>
    </div>
  );

  const requirementDisplay = owners && confirmations && (
    <div
      style={{
        fontSize: "1rem",
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-end",
        letterSpacing: "0.1rem",
        gap: "0.5rem",
        position: "relative",
      }}
    >
      {requirementHelp}
      <div>
        <span className="mono-nice"> {confirmations} </span>
      </div>
    </div>
  );

  return requirementDisplay ?? <></>;
};

export default Requirements;
