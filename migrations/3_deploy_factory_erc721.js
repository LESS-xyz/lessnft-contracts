const BN = require('bn.js');

require('dotenv').config();
const {
    DDS_BACKEND
} = process.env;

const Exchange = artifacts.require("Exchange");
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

    ExchangeInst = await Exchange.deployed();

    await deployer.deploy(
        FactoryErc721,
        ExchangeInst.address
    );
    let FactoryErc721Inst = await FactoryErc721.deployed();
    await FactoryErc721Inst.grantRole(await FactoryErc721Inst.SIGNER_ROLE(), DDS_BACKEND);
    console.log("FactoryErc721 =", FactoryErc721Inst.address);
};