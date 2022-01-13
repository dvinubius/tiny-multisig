import React from "react";
import { Slider, InputNumber, Row, Col, Input } from "antd";
import { useState } from "react";
import { softTextColor } from "../../styles";

const IntegerStep = ({ mi, ma, update, sliderWidth }) => {
  const [inputValue, setInputValue] = useState(mi);

  const onChange = value => {
    setInputValue(value);
    update(value);
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ width: sliderWidth ?? "12rem" }}>
        <Slider min={mi} max={ma} onChange={onChange} value={typeof inputValue === "number" ? inputValue : 0} />
      </div>
      <div
        style={{
          fontSize: "1rem",
          fontWeight: 500,
          padding: "0.125rem 0",
          width: "5rem",
          borderTop: "1px solid #d9d9d9",
          borderRight: "1px solid #d9d9d9",
          borderBottom: "1px solid #d9d9d9",
          textAlign: "center",
          borderRadius: 4,
        }}
      >
        {inputValue} <span style={{ color: softTextColor }}>of {ma}</span>
      </div>
    </div>
  );
};

export default IntegerStep;
