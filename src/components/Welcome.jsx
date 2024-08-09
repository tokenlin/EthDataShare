import React, { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { Loader } from ".";

const Input = ({ placeholder, name, type, value, handleChange }) => (
  <input
    placeholder={placeholder}
    type={type}
    step="0.001"
    value={value}
    onChange={(e) => handleChange(e, name)}
    className="my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism"
  />
);

const Welcome = () => {
  const {response, currentAccount, connectWallet, handleChange, sendTransactionDeposit, sendTransactionTransfer, sendTransactionWithdraw, formData, isLoading, errMsg} = useContext(TransactionContext);

  const depositSubmit = (e) => {
    
    const { amount, tx, publicKey } = formData;
    e.preventDefault();
    
    console.log("depositSubmit");
    sendTransactionDeposit();
  };

  const transferSubmit = (e) => {
    const { publicKey } = formData;
    e.preventDefault();
    if (!publicKey) return;
    sendTransactionTransfer();
  };

  const withdrawSubmit = (e) => {
    const { proveData } = formData;
    e.preventDefault();
    
    sendTransactionWithdraw();
  };


  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4">
        <div className="flex flex-1 justify-start items-start flex-col mf:mr-10">
          <h1 className="text-3xl sm:text-5xl text-white text-gradient py-1">
            Eth Data Share  <br /> On the Ethereum Ecosystem
           
          </h1>
          <p className="text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base">
            Connect the whole ethereum ecosystem.
          </p>


        </div>

        <div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
         
          <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
            <Input placeholder="address: 0xdA84992b027BBE08cd097f41adCC1e8a857c74Ed" name="address" type="text" handleChange={handleChange} />
            <Input placeholder="topics0: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" name="tx" type="topics0" handleChange={handleChange} />
            <Input placeholder="topics1: 0x00000000000000000000000059b983b1e5b386bce02312f45733e7d436d9d120" name="topics1" type="text" handleChange={handleChange} />
            <Input placeholder="topics2: 0x000000000000000000000000f5e8a439c599205c1ab06b535de46681aed1007a" name="topics2" type="text" handleChange={handleChange} />
            
            {isLoading.deposit
              ? <Loader />
              : (
                <button
                  type="button"
                  onClick={depositSubmit}
                  className="text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] hover:bg-[#3d4f7c] rounded-full cursor-pointer"
                >
                  Send Request
                </button>
              )}

            {errMsg.deposit != "" && (
                <p
                  className="text-left mt-5 text-red-500 font-light md:w-9/12 w-11/12 text-base"
                >
                  {errMsg.deposit}
                  </p>
              )}

            {response != "" && (
                <p className="text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base">
                  {"Response Data:"}
                  {"\n"}
                  {response.slice(0, 22)}
                  {"\n"}
                  {response.slice(22, 44)}
                  {"\n"}
                  {response.slice(44, 66)}
                </p>

              )} 

          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Welcome;
