import { CodeSandboxOutlined } from "@ant-design/icons";
import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function CustomHeader() {
  return (
    <PageHeader
      title={<CodeSandboxOutlined style={{ fontSize: "2.25rem", transform: "translateY(0.125rem)" }} />}
      subTitle={<div style={{ fontSize: "1.25rem" }}>Tiny MultiSig</div>}
      style={{ cursor: "pointer", display: "flex", alignItems: "center", height: "54px", padding: "1rem" }}
    />
  );
}
