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

async function _deploy(deployer, Contract, name, _args = []) {
    await deployer.deploy(
        Contract,
        ..._args
    );

    let instance = await Contract.deployed();
    await instance.grantRole(await instance.SIGNER_ROLE(), DDS_BACKEND);
    console.log(name + " = ", instance.address);
    return instance.address;
}

module.exports = async function (deployer, network) {
    if (network == "test" || network == "development")
        return;

    let address = await _deploy(deployer, Exchange, "Exchange");
    await _deploy(deployer, FactoryErc721, "FactoryErc721", [address]);

};