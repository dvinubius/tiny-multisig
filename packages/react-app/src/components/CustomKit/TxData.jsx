import { Typography } from "antd";
import React from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";

import "./TxData.css";

const { Text } = Typography;

export default function TxData({ data, width, fontSize, iconFontSize }) {
  const { currentTheme } = useThemeSwitcher();

  const catchEvent = e => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width }}
      onClick={catchEvent}
      className="TxData"
    >
      <div
        style={{
          paddingLeft: 5,
          fontSize: fontSize ?? 28,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {data}
      </div>
      <span style={{ fontSize: iconFontSize ?? 28 }}>
        <Text copyable={{ text: data }}>
          <a
            style={{ color: currentTheme === "light" ? "#222222" : "#ddd" }}
            target="_blank"
            href={""}
            rel="noopener noreferrer"
          >
            {" "}
          </a>
        </Text>
      </span>
    </div>
  );
}
