const BN = require('bn.js');

require('dotenv').config();
const {
    DDS_BACKEND,
    CONTRACT_URI
} = process.env;

const Exchange = artifacts.require("Exchange");
const FactoryErc1155 = artifacts.require("FactoryErc1155");

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
        FactoryErc1155,
        ExchangeInst.address,
        CONTRACT_URI
    );
    let FactoryErc1155Inst = await FactoryErc1155.deployed();
    await FactoryErc1155Inst.grantRole(await FactoryErc1155Inst.SIGNER_ROLE(), DDS_BACKEND);
    console.log("FactoryErc1155 =", FactoryErc1155Inst.address);
};