// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Chainlink Functions DON billing interface.
interface IFunctionsBilling {

  struct Config {
    uint32 fulfillmentGasPriceOverEstimationBP; // ══╗ Percentage of gas price overestimation to account for changes in gas price between request and response. Held as basis points (one hundredth of 1 percentage point)
    uint32 feedStalenessSeconds; //                  ║ How long before we consider the feed price to be stale and fallback to fallbackNativePerUnitLink.
    uint32 gasOverheadBeforeCallback; //             ║ Represents the average gas execution cost before the fulfillment callback. This amount is always billed for every request.
    uint32 gasOverheadAfterCallback; //              ║ Represents the average gas execution cost after the fulfillment callback. This amount is always billed for every request.
    uint72 donFee; //                                ║ Additional flat fee (in Juels of LINK) that will be split between Node Operators. Max value is 2^80 - 1 == 1.2m LINK.
    uint40 minimumEstimateGasPriceWei; //            ║ The lowest amount of wei that will be used as the tx.gasprice when estimating the cost to fulfill the request
    uint16 maxSupportedRequestDataVersion; // ═══════╝ The highest support request data version supported by the node. All lower versions should also be supported.
    uint224 fallbackNativePerUnitLink; // ═══════════╗ Fallback NATIVE CURRENCY / LINK conversion rate if the data feed is stale
    uint32 requestTimeoutSeconds; // ════════════════╝ How many seconds it takes before we consider a request to be timed out
  }

  /// @notice Estimate the total cost that will be charged to a subscription to make a request: transmitter gas re-reimbursement, plus DON fee, plus Registry fee
  /// @param - subscriptionId An identifier of the billing account
  /// @param - data Encoded Chainlink Functions request data, use FunctionsClient API to encode a request
  /// @param - callbackGasLimit Gas limit for the fulfillment callback
  /// @param - gasPriceWei The blockchain's gas price to estimate with
  /// @return - billedCost Cost in Juels (1e18) of LINK
  function estimateCost(
    uint64 subscriptionId,
    bytes calldata data,
    uint32 callbackGasLimit,
    uint256 gasPriceWei
  ) external view returns (uint96);

  // according to EHT/LINK price, the wei can be swapped by one LINK
  // 1 ETH = e18 wei
  // 1 LINK = e18 juels
  function getWeiPerUnitLink() external view returns (uint256);

  function getConfig() external view returns (Config memory);

  function getAdminFee() external view returns (uint72);

}
