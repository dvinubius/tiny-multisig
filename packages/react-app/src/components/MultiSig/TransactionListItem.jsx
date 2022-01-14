import React, { useContext, useEffect, useState } from "react";
import { Divider } from "antd";

import { AppContext, LayoutContext } from "../../App";
import MSTransactionOverview from "./MSTransactionOverview";
import { MsSafeContext } from "./MultiSig";
import ManageButton from "./ManageButton";
import MSTransactionDetails from "./MSTransactionDetails";
import {
  breakPointMsTxDetailsFit,
  detailsHeightLarge,
  detailsHeightNarrow,
  mediumBorder,
  mediumBorder2,
  pinkAccentBorder,
  swapGradient,
  swapGradientSimple,
} from "../../styles";

const TransactionListItem = function ({ transaction }) {
  const { userAddress } = useContext(AppContext);
  const { owners, confirmationsRequired: totalConfsNeeded } = useContext(MsSafeContext);
  const { widthAboveMsTxDetailsFit } = useContext(LayoutContext);

  const [showDetails, setShowDetails] = useState(false);
  const [detailsHeight, setDetailsHeight] = useState(0);
  const toggleDetailsVisibility = () => {
    const maxHeight = widthAboveMsTxDetailsFit ? detailsHeightNarrow : detailsHeightLarge;
    if (detailsHeight === 0) {
      setShowDetails(true);
      setTimeout(() => setDetailsHeight(maxHeight));
    } else {
      setDetailsHeight(0);
      // prevent request spamming due to
      // - too many open details (remove details from DOM)
      // - accidental closing of details (delay of 5 seconds)
      setTimeout(() => {
        setDetailsVisibilityNonce(Math.random());
      }, 5000);
    }
  };

  const [detailsVisibilityNonce, setDetailsVisibilityNonce] = useState(-1);
  useEffect(() => {
    if (detailsVisibilityNonce >= 0 && detailsHeight === 0) {
      setShowDetails(false);
    }
  }, [detailsVisibilityNonce]);

  const isSelfOwner = owners.includes(userAddress);
  console.log("SHOWDETAILS: ", showDetails);
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

          border: detailsHeight !== 0 ? pinkAccentBorder : mediumBorder,
        }}
        className="MultiSigTxItem"
      >
        <MSTransactionOverview transaction={transaction} totalConfsNeeded={totalConfsNeeded} />
        {!transaction.executed && (
          <>
            <ManageButton
              text={isSelfOwner ? "Manage" : "Details"}
              onClick={toggleDetailsVisibility}
              collapsed={detailsHeight === 0}
              wrapperStyle={{ alignSelf: "flex-end", marginTop: "1rem" }}
            />

            <div
              style={{
                maxHeight: detailsHeight,
                overflow: "hidden",
                transition: "all 0.3s ease-out",
              }}
            >
              {showDetails && (
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
