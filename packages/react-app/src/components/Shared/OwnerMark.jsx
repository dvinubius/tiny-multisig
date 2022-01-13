import { UserOutlined } from "@ant-design/icons";
import React from "react";
import { primaryColor } from "../../styles";
const OwnerMark = () => (
  <UserOutlined
    style={{
      color: primaryColor,
      // background: "hsla(209deg, 100%, 92%, 1)",
      borderRadius: "50%",
      width: "1.25rem",
      height: "1.25rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: `1px solid ${primaryColor}`,
    }}
  />
);

export default OwnerMark;
