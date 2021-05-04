const BN = require('bn.js');

require('dotenv').config();
const {
    DDS_BACKEND
} = process.env;

const Exchange = artifacts.require("Exchange");

const debug = "true";

const ZERO = new BN(0);
const ONE = new BN(1);
const TWO = new BN(2);
const THREE = new BN(3);

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

module.exports = async function (deployer, network) {
    if (network == "test" || network == "development")
        return;

    await deployer.deploy(
        Exchange
    );
    let ExchangeInst = await Exchange.deployed();
    await ExchangeInst.grantRole(await ExchangeInst.SIGNER_ROLE(), DDS_BACKEND);
    console.log("Exchange =", ExchangeInst.address);
};