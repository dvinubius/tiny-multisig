import { List, Spin } from "antd";
import React, { useContext, useState } from "react";

import CustomAddress from "../CustomKit/CustomAddress";
import "./MultiSig.css";
import { MsSafeContext } from "./MultiSig";
import { CheckCircleOutlined } from "@ant-design/icons";
import { primaryColor } from "../../styles";
import { AppContext } from "../../App";
import OwnerMark from "../Shared/OwnerMark";

const Owners = ({ confirmations }) => {
  const { userAddress } = useContext(AppContext);
  let { owners } = useContext(MsSafeContext);
  // owners = [...owners, ...owners, ...owners, ...owners, ...owners];

  const singleColumn = (
    <>
      {owners && owners.length && (
        <>
          <div>
            <List size="small">
              {owners.map(owner => (
                <List.Item style={{ padding: "0.25rem 2rem", display: "flex", justifyContent: "center" }}>
                  {/* <CustomAddress value={owner} fontSize={14} /> */}
                  {/* <div style={{ display: "flex", gap: "1rem" }}>
                    <CustomAddress value={owner} fontSize={14} />
                    {owner === userAddress ? <OwnerMark /> : ""}
                  </div> */}
                  <div style={{ position: "relative" }}>
                    <CustomAddress value={owner} fontSize={14} />
                    <div style={{ position: "absolute", right: "-2rem", top: 0 }}>
                      {owner === userAddress ? <OwnerMark /> : ""}
                    </div>
                  </div>
                </List.Item>
              ))}
            </List>
          </div>
        </>
      )}
    </>
  );

  const twoColumns = (
    <>
      {owners && owners.length && confirmations && (
        <>
          <div>
            <List size="small">
              {owners.map((owner, idx) => (
                <List.Item style={{ padding: "0.25rem 2rem", display: "flex", justifyContent: "center" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <CustomAddress value={owner} fontSize={14} />
                      {owner === userAddress ? <OwnerMark /> : ""}
                    </div>
                    <div style={{ opacity: confirmations[idx] ? 1 : 0.5 }}>
                      {<CheckCircleOutlined style={{ color: confirmations[idx] ? primaryColor : "#bebebe" }} />}
                    </div>
                  </div>
                </List.Item>
              ))}
            </List>
          </div>
        </>
      )}
    </>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column" }} className="OwnersCard">
      {(!owners || !owners.length) && (
        <div style={{ height: "8rem", display: "flex", alignItems: "center" }}>
          <Spin></Spin>
        </div>
      )}
      <div
        style={{
          overflowY: "auto",
          display: "flex",
          alignItems: "stretch",
          flexDirection: "column",
        }}
      >
        {confirmations ? twoColumns : singleColumn}
      </div>
    </div>
  );
};

export default Owners;
