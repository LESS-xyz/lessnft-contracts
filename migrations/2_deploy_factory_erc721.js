const BN = require('bn.js');

require('dotenv').config();
const {
} = process.env;

const FactoryErc721 = artifacts.require("FactoryErc721");

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
        FactoryErc721
    );
    let FactoryErc721Inst = await FactoryErc721.deployed();
    console.log("FactoryErc721 =", FactoryErc721Inst.address);
};