import React, { useContext, useEffect, useState } from "react";
import { Button, Divider } from "antd";

import { AppContext, LayoutContext } from "../../App";
import MSTransactionOverview from "./MSTransactionOverview";
import { MsSafeContext } from "./MultiSig";
import MSTransactionDetails from "./MSTransactionDetails";
import {
  detailsHeightLarge,
  detailsHeightNarrow,
  mediumBorder,
  mediumButtonMinWidth,
  pinkAccentBorder,
  swapGradientSimple,
} from "../../styles";
import { ArrowsAltOutlined, LoginOutlined } from "@ant-design/icons";

const TransactionListItem = function ({ transaction, onExpand, expanded }) {
  const { userAddress } = useContext(AppContext);
  const { owners, confirmationsRequired: totalConfsNeeded } = useContext(MsSafeContext);
  const { widthAboveMsTxDetailsFit } = useContext(LayoutContext);

  const detailsHeight = widthAboveMsTxDetailsFit ? detailsHeightNarrow : detailsHeightLarge;

  const isSelfOwner = owners.includes(userAddress);

  return (
    <div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          // backgroundColor: "white",
          background: swapGradientSimple,
          borderRadius: ".25rem",
          padding: "1rem",

          // border: pinkAccentBorder,
          border: mediumBorder,
        }}
        className="MultiSigTxItem"
      >
        <MSTransactionOverview transaction={transaction} totalConfsNeeded={totalConfsNeeded} />
        {!transaction.executed && (
          <>
            {!expanded && (
              <Button
                size="large"
                onClick={() => onExpand()}
                style={{ width: mediumButtonMinWidth, alignSelf: "flex-end", marginTop: "1rem" }}
              >
                {/* {isSelfOwner ? "Manage" : "Details"} <ArrowsAltOutlined /> */}
                {isSelfOwner ? "Manage" : "Details"} <LoginOutlined />
              </Button>
            )}

            <div
              style={{
                maxHeight: detailsHeight,
                overflow: "hidden",
                transition: "all 0.3s ease-out",
              }}
            >
              {expanded && (
                <>
                  <Divider style={{ margin: "1rem 0" }} />
                  <MSTransactionDetails transaction={transaction} isSelfOwner={isSelfOwner} />
                </>
              )}
            </div>
          </>
        )}
      </div>
      <Divider />
    </div>
  );
};
export default TransactionListItem;
