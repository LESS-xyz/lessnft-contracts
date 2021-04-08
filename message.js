const EthCrypto = require("eth-crypto");

let signer = EthCrypto.createIdentity();

message = EthCrypto.hash.keccak256([
    { type: "address", value: "0xeeFBd5F023bb701D45F8fbfbA88eB2C6b196F010" },
    { type: "uint256", value: "1" }
]);
signature = EthCrypto.sign(signer.privateKey, message);

console.log("address =", signer.address);
console.log("private =", signer.privateKey);
console.log("message =", message);
console.log("signature =", signature);