import React, { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { Loader } from ".";

const Input = ({ placeholder, name, type, value, handleChange, ifDisabled }) => (
  ({ifDisabled}.ifDisabled) == "true" ? 
  (
    <input
    placeholder={placeholder}
    type={type}
    step="0.001"
    value={value}
    onChange={(e) => handleChange(e, name)}
    disabled
    className="my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism"/>
  ):(
    <input
    placeholder={placeholder}
    type={type}
    step="0.001"
    value={value}
    onChange={(e) => handleChange(e, name)}
    className="my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism"/>
  )
);

const Welcome = () => {
  const {response, currentAccount, connectWallet, handleChange, sendTransactionDeposit, requestToVerifyProof, formData, isLoading, errMsg} = useContext(TransactionContext);

  const depositSubmit = (e) => {
    e.preventDefault();
    console.log("depositSubmit");
    sendTransactionDeposit();
  };

  const verifyProof = (e) => {
    e.preventDefault();
    requestToVerifyProof();
  };


  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4">
        <div className="flex flex-1 justify-start items-start flex-col mf:mr-10">
          <h1 className="text-3xl sm:text-5xl text-white text-gradient py-1">
            Eth Data Share  <br /> for the whole Ethereum Ecosystem
           
          </h1>
          <p className="text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base">
            Connect the whole ethereum ecosystem.
          </p>


        </div>

        <div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
         
          <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
            <Input placeholder="chainId: 2810" name="chainId" type="text" handleChange={handleChange} ifDisabled=""/>
            <Input placeholder="contractAddress: 0xfC391a10dA60A6940F2d6d89D2b744aa4d796a68" name="contractAddress" type="topics0" handleChange={handleChange} ifDisabled=""/>
            <Input placeholder="storagePosition: 0x3" name="storagePosition" type="text" handleChange={handleChange} ifDisabled=""/>
          
            
            {isLoading.deposit
              ? <Loader />
              : (
                <div>
                  <button
                    type="button"
                    onClick={depositSubmit}
                    className="text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] hover:bg-[#3d4f7c] rounded-full cursor-pointer"
                  >
                    Send Request to Get Proof
                  </button>

                  <Input 
                    placeholder="requestId: 0x..." 
                    id="disabled-input" aria-label="disabled input"
                    ifDisabled = "true"
                    value={formData.requestId}
                    name="requestId" type="text" handleChange={handleChange}/>

                  <Input 
                    placeholder="storageValue: 0x..." 
                    id="disabled-input" aria-label="disabled input"
                    ifDisabled = "true"
                    value={formData.storageValue}
                    name="storageValue" type="text" handleChange={handleChange}/>

                  <Input 
                    placeholder="proof: 0x..." 
                    id="disabled-input" aria-label="disabled input"
                    ifDisabled = "true"
                    value={formData.proof}
                    name="proof" type="text" handleChange={handleChange}/>

                  <ul className="border-b-2 border-white grid grid-cols-2 gap-3 py-3 items-center">
                    <li>
                      <button
                          type="button"
                          onClick={verifyProof}
                          className="text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] hover:bg-[#3d4f7c] rounded-full cursor-pointer"
                        >
                          Verify Proof
                        </button>
                    </li>
                    


                    <li><Input 
                        // placeholder="" 
                        id="disabled-input" aria-label="disabled input"
                        value={formData.proofVerified}
                        ifDisabled = "true"
                        name="proofVerified" type="text" handleChange={handleChange} /></li>

                  </ul>

              </div>
              )}

            {errMsg.deposit != "" && (
                <p
                  className="text-left mt-5 text-red-500 font-light md:w-9/12 w-11/12 text-base"
                >
                  {errMsg.deposit}
                  </p>
              )}

          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Welcome;
