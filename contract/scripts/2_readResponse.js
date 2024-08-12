const { decodeResult, ReturnType } = require("@chainlink/functions-toolkit");
const { Contract, ethers } = require("ethers");

const { provider, signer } = require("../connection.js");
const abi = require("../package/abi/FunctionsConsumer.json");

const fs = require("fs");
const path = require("path");

// sepolia testnet
const consumerAddress = "0x8c21CaE0FbF7D28D4c84ae4430fa1C85eBef50Cd";  


strToUtf8Bytes = (text) =>{
  const code = encodeURIComponent(text);
  const bytes = [];  
  for(let i=0; i<code.length;i++){
    const c = code.charAt(i);
    if(c === '%'){
      const hex = code.charAt(i+1) + code.charAt(i+2);
      const hexval = parseInt(hex, 16);
      bytes.push(hexval);
      i += 2;
    } else {
      bytes.push(c.charCodeAt(0));
    }
  }
  let bytesStr = "";
  for(let i=0; i<bytes.length;i++){
    if(bytes[i] < 16){
      bytesStr += "0" + bytes[i].toString(16);  
    }else{
      bytesStr += bytes[i].toString(16);
    }
  }
  bytesStr = "0x" + bytesStr;
  return bytesStr;
}


  
  var byteStrToUint8Array = function(str){
    str = str.replaceAll("0x", "");
    let length = str.length;
    if(length % 2 == 1) throw Error("Invalid string input1");

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

  function utf8ArrayToStr(utf8Bytes){
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


async function readResponse () {
  const functionsConsumer = new Contract(consumerAddress, abi, signer);

  const latestResponse = await functionsConsumer.getLatestResponse();

  const s_lastRequestId = latestResponse[0];
  const s_lastResponse = latestResponse[1];
  const s_lastError = latestResponse[2];
  
  console.log("s_lastRequestId: ", s_lastRequestId);
  console.log("Bytes: ");
  console.log("s_lastResponse: ", s_lastResponse);
  console.log("s_lastError: ", s_lastError);
  
  console.log("");

  return s_lastResponse;
  
};



async function checkSignature(value_msgHash_Signature_Bytes){
  let value_msgHash_Signature = value_msgHash_Signature_Bytes.replaceAll("0x", "");
  let storeValue = "0x" + value_msgHash_Signature.slice(0, 64);
  let msgHash = "0x" + value_msgHash_Signature.slice(64, 128);
  let signature = "0x" + value_msgHash_Signature.slice(128, value_msgHash_Signature.length);

  console.log("storeValue: ", storeValue);
  console.log("msgHash: ", msgHash);
  console.log("signature: ", signature);

  const functionsConsumer = new Contract(consumerAddress, abi, signer);
  const checkResult = await functionsConsumer.checkSignature(msgHash, signature);

  console.log("checkResult: ", checkResult);
  
  console.log("");
  
};


async function run(){
  let value_msgHash_Signature_Bytes = await readResponse();
  await checkSignature(value_msgHash_Signature_Bytes);
}

run();
