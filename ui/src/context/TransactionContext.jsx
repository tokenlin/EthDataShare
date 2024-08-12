import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractAddress, contractABI} from "../utils/constants";
import {sourceBytes} from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
  return transactionsContract;
};

const byteStrToUint8Array = (str) => {
  str = str.replaceAll("0x", "");
  let length = str.length;
  if(length % 2 == 1) throw Error("Invalid string input1");
  /*
  0:48
  9:57

  A:65
  F:70

  a:97
  f:102

  */
  for(let i=0; i<length; i++){
    let num = str[i].charCodeAt();
    if(num < 48 || num >57&&num<65 || num>70&&num<97 || num > 102) throw Error("Invalid string input2");
  }

  let uint8Array = new Uint8Array(length / 2);

  let j=0;
  for(let i=0; i<length; i=i+2){
    let subStr = str.slice(i, i+2);
    uint8Array[j++] = parseInt(subStr, 16);
  }
  return uint8Array;
}

const utf8ArrayToStr = (utf8Bytes) => {
  var unicodeStr ="";
  for (var pos = 0; pos < utf8Bytes.length;){
      var flag= utf8Bytes[pos];
      var unicode = 0 ;
      if ((flag >>>7) === 0 ) {
          unicodeStr+= String.fromCharCode(utf8Bytes[pos]);
          pos += 1;

      } else if ((flag &0xFC) === 0xFC ){
          unicode = (utf8Bytes[pos] & 0x3) << 30;
          unicode |= (utf8Bytes[pos+1] & 0x3F) << 24;
          unicode |= (utf8Bytes[pos+2] & 0x3F) << 18;
          unicode |= (utf8Bytes[pos+3] & 0x3F) << 12;
          unicode |= (utf8Bytes[pos+4] & 0x3F) << 6;
          unicode |= (utf8Bytes[pos+5] & 0x3F);
          unicodeStr+= String.fromCodePoint(unicode) ;
          pos += 6;

      }else if ((flag &0xF8) === 0xF8 ){
          unicode = (utf8Bytes[pos] & 0x7) << 24;
          unicode |= (utf8Bytes[pos+1] & 0x3F) << 18;
          unicode |= (utf8Bytes[pos+2] & 0x3F) << 12;
          unicode |= (utf8Bytes[pos+3] & 0x3F) << 6;
          unicode |= (utf8Bytes[pos+4] & 0x3F);
          unicodeStr+= String.fromCodePoint(unicode) ;
          pos += 5;

      } else if ((flag &0xF0) === 0xF0 ){
          unicode = (utf8Bytes[pos] & 0xF) << 18;
          unicode |= (utf8Bytes[pos+1] & 0x3F) << 12;
          unicode |= (utf8Bytes[pos+2] & 0x3F) << 6;
          unicode |= (utf8Bytes[pos+3] & 0x3F);
          unicodeStr+= String.fromCodePoint(unicode) ;
          pos += 4;

      } else if ((flag &0xE0) === 0xE0 ){
          unicode = (utf8Bytes[pos] & 0x1F) << 12;;
          unicode |= (utf8Bytes[pos+1] & 0x3F) << 6;
          unicode |= (utf8Bytes[pos+2] & 0x3F);
          unicodeStr+= String.fromCharCode(unicode) ;
          pos += 3;

      } else if ((flag &0xC0) === 0xC0 ){ //110
          unicode = (utf8Bytes[pos] & 0x3F) << 6;
          unicode |= (utf8Bytes[pos+1] & 0x3F);
          unicodeStr+= String.fromCharCode(unicode) ;
          pos += 2;

      } else{
          unicodeStr+= String.fromCharCode(utf8Bytes[pos]);
          pos += 1;
      }
  }
  return unicodeStr;
}







export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({ chainId: "", contractAddress: "", storagePosition: "", requestId: "", storageValue:"", proof:"", proofVerified:""});
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState({ deposit: false, withdraw: false});
  const [errMsg, setErrMsg] = useState({ deposit: "", withdraw: ""});
  
  const [response, setResponse] = useState("");

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getCallBackMsg();

      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCallBackMsg = async () => {
    try {
      if (ethereum) {

        const requestId = localStorage.getItem("requestIdLocal");

        if(requestId == "") return;

        const transactionsContract = createEthereumContract();
        const latestResponse = await transactionsContract.getLatestResponse();


        const [s_lastRequestId, s_lastResponse, s_lastError] = latestResponse;

        let value_msgHash_Signature = "";
        let storeValue = "";
        
        if(s_lastResponse != "0x"){
          value_msgHash_Signature = s_lastResponse.replaceAll("0x", "");
         
          storeValue = "0x" + value_msgHash_Signature.slice(0, 64);

        }

        console.log("requestId: ", requestId);
        console.log("s_lastRequestId: ", s_lastRequestId);
        console.log("requestId == s_lastRequestId: ", requestId == s_lastRequestId);
        if(requestId == s_lastRequestId){
          console.log("requestId == s_lastRequestId: ", requestId == s_lastRequestId);
      
          if(value_msgHash_Signature != "") {
            setformData((prevState) => ({ ...prevState, ["storageValue"]: storeValue}));
            setformData((prevState) => ({ ...prevState, ["proof"]: ("0x" + value_msgHash_Signature)}));
            window.localStorage.setItem("requestIdLocal", "");
          }
        }


      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts", });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };



  const sendTransactionDeposit = async () => {
    try {
      if (ethereum) {
        window.localStorage.setItem("requestId", "");
        
        const { chainId, contractAddress, storagePosition} = formData;
        const transactionsContract = createEthereumContract();

        if(chainId == "" || contractAddress == "" || storagePosition == ""){
          console.log("chainId, contractAddress, storagePosition can not be empty");
          return;
        }
       

       
        const sourceString =  utf8ArrayToStr(byteStrToUint8Array(sourceBytes));

        const args = [chainId, contractAddress, storagePosition];
        const callbackGasLimit = 300_000;

        const encryptedSecretsRef = "0x7383e9ecab75f5b7e21509e90b20ed7a0259489ed4ec0de1aaea6c4d12fd55f40a98b6dc06b51c115ea651fe4a04c82da00f54c75dc44763bde0da4d8ac272c8cf8125833c84c3ef2a38a6e586ccf4d4ed8f41c96c725e00ca240930cb3a1984075d09b9b0c04965330e77a5b9097f928e844b47e65bb137ff77433138d535d198efb402e60ea97c4a33ac14a01168c93d83662b8bbcdcd1e6a560e81092183ab3f6bf15ef33db6fdebf9a6479aa8fc53392f123d2b2ab48ba8a3e7912568f2c4dc64d0cb2ff97381f5d448a26b6b489414d99108c6998581bddc4da6f6c21f60a337930060feb2e7a54d71c1f8203aae0";

        const subscriptionId = "1759";
        const Location = {Remote: 1};



        const transactionHash = await transactionsContract.SendRequestWithSecret(
          sourceString,
          Location.Remote,
          encryptedSecretsRef,
          args,
          [],
          subscriptionId,
          callbackGasLimit
        );

        setIsLoading((prevState) => ({ ...prevState, deposit: true }));
        setErrMsg((prevState) => ({ ...prevState, deposit: "" }));
        console.log(`Loading hash- ${transactionHash.hash}`);

        const txReceipt = await transactionHash.wait();
        const requestId = txReceipt.events[2].args.id;  // for sepolia testnet

        window.localStorage.setItem("requestIdLocal", requestId);
        setformData((prevState) => ({ ...prevState, ["requestId"]: requestId}));

        console.log(`Success hash- ${transactionHash.hash}`);
        console.log(`requestId- ${requestId}`);

        setIsLoading((prevState) => ({ ...prevState, deposit: false }));
   
      } else {
        console.log("No ethereum object");
        setErrMsg((prevState) => ({ ...prevState, deposit: "No ethereum object" }));
      }
    } catch (error) {
      console.log(error);
      setErrMsg((prevState) => ({ ...prevState, deposit: "Deposit error: "+error.message}));
      throw new Error("sendTransactionDeposit error");
    }
  };







  const requestToVerifyProof = async () => {
    try {
      if (ethereum) {
       
        let { proof} = formData;
        let storeValue = "";
        let msgHash = "";
        let signature = "";

        if(proof != ""){
          proof = proof.replaceAll("0x", "");

          storeValue = "0x" + proof.slice(0, 64);
          msgHash = "0x" + proof.slice(64, 128);
          signature = "0x" + proof.slice(128, proof.length);

          const transactionsContract = createEthereumContract();
       
          const checkResult = await transactionsContract.checkSignature(msgHash, signature);
  
          setformData((prevState) => ({ ...prevState, ["proofVerified"]: checkResult}));
        }else{
          console.log("no proof updated")
        }
   
      } else {
        console.log("No ethereum object");
        setErrMsg((prevState) => ({ ...prevState, deposit: "No ethereum object" }));
      }
    } catch (error) {
      console.log(error);
      
      throw new Error("requestToVerifyProof error");
    }
  };



  


  useEffect(()=>{
    setInterval(()=>{
      checkIfWalletIsConnect();
      
    }, 3000);
  }, []);


  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        isLoading,
        errMsg,
        response,
        sendTransactionDeposit,
        requestToVerifyProof,
        handleChange,
        formData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
