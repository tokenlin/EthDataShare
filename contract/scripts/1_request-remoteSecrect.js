const { Contract } = require("ethers");
const fs = require("fs");
const path = require("path");
const { Location } = require("@chainlink/functions-toolkit");
require("@chainlink/env-enc").config();

const { signer } = require("../connection.js");
const abi = require("../package/abi/FunctionsConsumer.json");

// sepolia test
const consumerAddress = "0x8c21CaE0FbF7D28D4c84ae4430fa1C85eBef50Cd";
const subscriptionId = "1759";

const encryptedSecretsRef = "0x7383e9ecab75f5b7e21509e90b20ed7a0259489ed4ec0de1aaea6c4d12fd55f40a98b6dc06b51c115ea651fe4a04c82da00f54c75dc44763bde0da4d8ac272c8cf8125833c84c3ef2a38a6e586ccf4d4ed8f41c96c725e00ca240930cb3a1984075d09b9b0c04965330e77a5b9097f928e844b47e65bb137ff77433138d535d198efb402e60ea97c4a33ac14a01168c93d83662b8bbcdcd1e6a560e81092183ab3f6bf15ef33db6fdebf9a6479aa8fc53392f123d2b2ab48ba8a3e7912568f2c4dc64d0cb2ff97381f5d448a26b6b489414d99108c6998581bddc4da6f6c21f60a337930060feb2e7a54d71c1f8203aae0";

const sendRequest = async () => {
  if (!consumerAddress || !subscriptionId) {
    throw Error("Missing required environment variables.");
  }
  const functionsConsumer = new Contract(consumerAddress, abi, signer);

  const source = fs
    .readFileSync(path.resolve(__dirname, "../source-with-remote-code.js")) // source-with-remote-code
    .toString();

 let args0 = "2810";  // Morph holesky testnet
 let args1 = "0xfC391a10dA60A6940F2d6d89D2b744aa4d796a68";  // contractAddress
 let args2 = "0x3"  // storagePosition
 
 const args = [args0, args1, args2];
 const callbackGasLimit = 300_000;


  console.log("\n Sending the remoteSecret Request....")
  const requestTx = await functionsConsumer.SendRequestWithSecret(  // secret input
    source,
    Location.Remote, // Location.DONHosted,
    encryptedSecretsRef,
    args,
    [], // bytesArgs can be empty
    subscriptionId,
    callbackGasLimit
  );

  const txReceipt = await requestTx.wait(1);
  console.log("txReceipt:");
  console.log(
    `Request made.  TxHash is ${requestTx.hash}`
  );
  
  console.log("");
};

sendRequest().catch(err => {
  console.log("\nError making the Functions Request : ", err);
});
