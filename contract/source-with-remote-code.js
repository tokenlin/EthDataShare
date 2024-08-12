
const codeUrl = "https://gist.githubusercontent.com/tokenlin/66193bec38e13b8410951253c4aaa304/raw/9c895388161a3ca9b8977fa7039e8b15b4d9312a/EthShenZhen.txt";

const codeRequest = await Functions.makeHttpRequest({
  url: codeUrl
});

if (codeRequest.error) {
  console.error(codeRequest.error);
  throw Error(`Get text failed`);
  }

let code = decodeURIComponent(codeRequest.data.text);  // get the code

code = code + "\nreturn [getValueMsghashSignatureUtf8Array]";
const returnFunction= new Function([],code);
const [getValueMsghashSignatureUtf8Array] = returnFunction();


// input args
let privateSalt = secrets.apiKey;
let chainId = args[0]; // Morph test net
let contractAddress = args[1];  // address
let storagePosition = args[2];  // bytes32

const returnUtf8Array = await getValueMsghashSignatureUtf8Array(privateSalt, chainId, contractAddress, storagePosition, Functions);

return returnUtf8Array;

