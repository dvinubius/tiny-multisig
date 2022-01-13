import { Input } from "antd";
import React from "react";

const { TextArea } = Input;

const BytesInput = ({ disabled, value, onChange, placeholder, wrapperStyle }) => {
  const formatValue = v => {
    if (!v) return;

    if (!v.toString().startsWith("0x")) {
      v = `0x${v}`;
    }
    return v;
  };

  const update = event => {
    let v = event.target.value;
    onChange(formatValue(v));
  };

  return (
    <TextArea
      rows={5}
      placeholder={placeholder}
      disabled={disabled}
      style={{ ...wrapperStyle, textAlign: "left" }}
      value={formatValue(value)}
      onChange={update}
    />
  );
};
export default BytesInput;
