// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

import "./interfaces/IFunctionsBilling.sol";


contract FunctionsConsumer is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;
    

    bytes32 public immutable donId; // DON ID for the Functions DON to which the requests are sent
    address public immutable functionsBillingAddress;
    LinkTokenInterface immutable linkToken;

    address public validator = 0x07bF8D887a78d643A7dF35A2dD07094a307C498d;


    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    constructor(
        address _owner,
        address _functionsBillingAddress,
        address _linkToken,
        address _router,
        bytes32 _donId
    )
        FunctionsClient(_router)
        ConfirmedOwner(_owner)
    {
        donId = _donId;
        linkToken = LinkTokenInterface(_linkToken);
        functionsBillingAddress = _functionsBillingAddress;

    }

    function setValidator(address _new) public onlyOwner {
        validator = _new;
    }

    function checkSignature(bytes32 _msgHash, bytes memory _signature) public view returns(bool _bool){
        address signer = recoverSigner(_msgHash, _signature);
        if(signer == validator) return true;
        return false;
    }

    function recoverSigner(bytes32 _msgHash, bytes memory _signature) public pure returns (
        address){
        require(_signature.length == 65, "invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(_signature, 0x20))
            s := mload(add(_signature, 0x40))
            v := byte(0, mload(add(_signature, 0x60)))
        }
        return (ecrecover(_msgHash, v, r, s));
    }

    /**
     * @notice Triggers an on-demand Functions request using remote encrypted secrets
     * @param source JavaScript source code
     * @param secretsLocation Location of secrets (only Location.Remote & Location.DONHosted are supported)
     * @param encryptedSecretsReference Reference pointing to encrypted secrets
     * @param args String arguments passed into the source code and accessible via the global variable `args`
     * @param bytesArgs Bytes arguments passed into the source code and accessible via the global variable `bytesArgs` as hex strings
     * @param subscriptionId Subscription ID used to pay for request (FunctionsConsumer contract address must first be added to the subscription)
     * @param callbackGasLimit Maximum amount of gas used to call the inherited `handleOracleFulfillment` method
     */
    function SendRequestWithSecret(
        string memory source,
        FunctionsRequest.Location secretsLocation,
        bytes memory encryptedSecretsReference,
        string[] memory args,
        bytes[] memory bytesArgs,
        uint64 subscriptionId,
        uint32 callbackGasLimit
    ) public returns (bytes32 RequestId) {

        FunctionsRequest.Request memory req; // Struct API reference: https://docs.chain.link/chainlink-functions/api-reference/functions-request
        req.initializeRequest(
            FunctionsRequest.Location.Inline,
            FunctionsRequest.CodeLanguage.JavaScript,
            source
        );
        req.secretsLocation = secretsLocation;
        req.encryptedSecretsReference = encryptedSecretsReference;
        if (args.length > 0) {
            req.setArgs(args);
        }
        if (bytesArgs.length > 0) {
            req.setBytesArgs(bytesArgs);
        }

        // send request and return Id
        RequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            callbackGasLimit,
            donId
        );
    }


    /**
     * @notice Store latest result/error
     * @param requestId The request ID, returned by sendRequest()
     * @param response Aggregated response from the user code
     * @param err Aggregated error from the user code or from the execution pipeline
     * Either response or error parameter will be set, but never both
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {

        s_lastRequestId = requestId;
        s_lastResponse = response;
        s_lastError = err;
    }

    function getLatestResponse() public view returns(bytes32, bytes memory, bytes memory){
        return (s_lastRequestId, s_lastResponse, s_lastError);
    } 

    function getStringHash(string memory _s) public pure returns (bytes32)
    {
        return keccak256(abi.encodePacked(_s));
    }

    function getBytesHash(bytes memory _b) public pure returns(bytes32){
      return keccak256(abi.encodePacked(_b));
    }

    function getBytesFromString(string memory _s) public pure returns(bytes memory){
      return bytes(_s);
    }

    function getStringFromBytes(bytes memory _b) public pure returns(string memory){
      return string(_b);
    }
}
