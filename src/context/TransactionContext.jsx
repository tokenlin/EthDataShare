import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractAddressPool, contractABIPool} from "../utils/constants";
import { contractAddressSupervisor, contractABISupervisor } from "../utils/constants";
import {sourceBytes} from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const createEthereumContractPool = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddressPool, contractABIPool, signer);
  return transactionsContract;
};



const createEthereumContractSupervisor = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddressSupervisor, contractABISupervisor, signer);
  return transactionsContract;
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({ amount: "", tx: "", publicKey: "", proveData: ""});
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState({ deposit: false, withdraw: false});
  const [errMsg, setErrMsg] = useState({ deposit: "", withdraw: ""});
  
  const [response, setResponse] = useState("");
  window.localStorage.setItem("requestId", "");


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

        const transactionsContract = createEthereumContractSupervisor();
        const s_lastRequestId = await transactionsContract.s_lastRequestId();

        const requestId = localStorage.getItem("requestId");


        console.log(requestId);
        console.log(s_lastRequestId);
        console.log(requestId == s_lastRequestId);

        if(requestId == s_lastRequestId){
          const s_lastResponse = await transactionsContract.s_lastResponse();
          const lastResponse = await transactionsContract.getStringFromBytes(s_lastResponse);
          setResponse(lastResponse);
          setIsLoading((prevState) => ({ ...prevState, deposit: false }));
          
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
        
        const { amount, tx, publicKey} = formData;
        const transactionsContract = createEthereumContractSupervisor();
       

        const sourceString = await transactionsContract.getStringFromBytes(sourceBytes);

      
        const transactionHash = await transactionsContract.mySendRequest(sourceString, [], [], 1759, 300000);
        setIsLoading((prevState) => ({ ...prevState, deposit: true }));
        setErrMsg((prevState) => ({ ...prevState, deposit: "" }));
        console.log(`Loading - ${transactionHash.hash}`);

        const txReceipt = await transactionHash.wait();
        const requestId = txReceipt.events[2].args.id;

        window.localStorage.setItem("requestId", requestId);

        console.log(`Success - ${transactionHash.hash}`);
   
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
        handleChange,
        formData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
