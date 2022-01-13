import { CodeSandboxOutlined, FileUnknownOutlined, HomeOutlined } from "@ant-design/icons";
import { Button, Divider, Spin, Typography } from "antd";
import React, { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AppContext } from "../App";
import MultiSig from "../components/MultiSig/MultiSig";
import { mediumButtonMinWidth, softTextColor } from "../styles";
const { Title } = Typography;

const SingleMultiSigPage = () => {
  const { injectableAbis, createdContracts, numCreatedContracts } = useContext(AppContext);
  const { idx } = useParams();

  const contract = createdContracts && createdContracts.find(c => c.idx.toString() === idx);

  if (!contract) {
    const doesntExist =
      typeof numCreatedContracts !== "undefined" && typeof idx !== "undefined" && +idx >= numCreatedContracts;
    return (
      <div
        style={{
          height: "50vh",
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
        }}
      >
        {doesntExist && (
          <>
            <div style={{ color: softTextColor, fontSize: "1.25rem" }}>
              <FileUnknownOutlined /> This safe doesn't exist
            </div>
            <Link to="/">
              <Button style={{ minWidth: mediumButtonMinWidth }} size="large">
                <HomeOutlined />
                My Safes
              </Button>
            </Link>
          </>
        )}
        {!doesntExist && <Spin size="large" />}
      </div>
    );
  }

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
      {contract && (
        <div style={{ alignSelf: "stretch", margin: "0 1rem", display: "flex", gap: "1rem", position: "relative" }}>
          <Link to="/">
            <Button style={{ minWidth: mediumButtonMinWidth }} size="large">
              {/* <CodeSandboxOutlined /> */}
              <HomeOutlined />
              My Safes
            </Button>
          </Link>
          <Title
            level={2}
            style={{ fontWeight: 400, position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)" }}
          >
            <CodeSandboxOutlined />
          </Title>
        </div>
      )}
      {/* NAVI */}
      <div style={{ width: "100%", padding: "0 1rem" }}>
        <Divider style={{ margin: "1rem 0 0" }}>
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
            {contract.name}
          </Title>
        </Divider>
      </div>

      {/* CONTENT */}
      {contract && injectableAbis && (
        <div style={{ alignSelf: "stretch", flex: 1, overflow: "hidden" }}>
          <MultiSig contract={contract} />
        </div>
      )}
    </div>
  );
};
export default SingleMultiSigPage;
