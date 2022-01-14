import { ShareAltOutlined } from "@ant-design/icons";
import { Button, Popover, Typography } from "antd";
import { useState } from "react";
import { APP_URL } from "../../constants";

import { primaryColor, softBorder, softTextColor, swapGradient } from "../../styles";
import OwnerMark from "./OwnerMark";

const UserStatus = ({ isSelfOwner, isSelfCreator, idx }) => {
  const onCopy = () => {
    navigator.clipboard.writeText(`${APP_URL}/safe/${idx}`);
    setTimeout(() => setCopyVisible(false), 1500);
  };
  const handleVisibleChange = v => setCopyVisible(v);

  const [copyVisible, setCopyVisible] = useState(false);
  const copyLink = isSelfCreator && (
    <Popover
      content="Copied!"
      trigger="click"
      placement="left"
      visible={copyVisible}
      onVisibleChange={handleVisibleChange}
    >
      <Button size="small" onClick={onCopy}>
        Copy Link <ShareAltOutlined style={{ width: "1.25rem", height: "1.25rem", margin: 0 }} />
      </Button>
    </Popover>
  );

  const keywordColor = "deeppink";
  const ownerText = isSelfOwner && (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
      <span>
        You <span style={{ color: keywordColor }}>co-own</span> this safe.
      </span>
      <div style={{ marginLeft: "0.5rem" }}>
        <OwnerMark />
      </div>
    </div>
  );

  const creatorText = isSelfCreator && (
    <span>
      You <span style={{ color: keywordColor }}>created</span> this safe.
    </span>
  );

  const viewerText = !isSelfOwner && !isSelfCreator && <>You are not an owner of this safe.</>;

  const message = (
    <div
      style={{
        fontWeight: 400,
        fontSize: "1rem",
        color: softTextColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "0.5rem",
      }}
    >
      {creatorText}
      {ownerText}
      {viewerText}
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        minHeight: 40,

        display: "flex",
        alignItems: "center",
        // justifyContent: "flex-start",
        // justifyContent: "center",
        justifyContent: "space-between",
        background: swapGradient,
        gap: "1rem",
        padding: "0.5rem 1rem",
        border: softBorder,
      }}
    >
      {message}
      {copyLink}
    </div>
  );
};
export default UserStatus;
