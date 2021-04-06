const BN = require("bn.js");
const chai = require("chai");
const { expect, assert } = require("chai");
const expectRevert = require("./utils/expectRevert.js");
const helper = require("openzeppelin-test-helpers/src/time.js");
const time = require("openzeppelin-test-helpers/src/time.js");
const assertArrays = require('chai-arrays');
const { web3 } = require("openzeppelin-test-helpers/src/setup");
chai.use(assertArrays);
chai.use(require("chai-bn")(BN));
const EthCrypto = require("eth-crypto");

require('dotenv').config();
const {
} = process.env;

const MINUS_ONE = new BN(-1);
const ZERO = new BN(0);
const ONE = new BN(1);
const TWO = new BN(2);
const THREE = new BN(3);
const FOUR = new BN(4);
const FIVE = new BN(5);
const SIX = new BN(6);
const SEVEN = new BN(7);
const EIGHT = new BN(8);
const NINE = new BN(9);
const TEN = new BN(10);

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const DECIMALS = new BN(8);
const ONE_TOKEN = TEN.pow(DECIMALS);
const ONE_ASSET_TOKEN = TEN.pow(new BN(18));
const ONE_ETH = TEN.pow(new BN(18));

const INITIAL_TOKEN_MINT = TEN.pow(new BN("24"));

const NFT_721_NAME = "Test NFT 1";
const NFT_721_SYMBOL = "test1";
const NFT_721_BASE_URI = "test.com/";

const NFT_1155_NAME = "Test NFT 1155 1";
const NFT_1155_SYMBOL = "test1 1155";
const NFT_1155_BASE_URI = "test1155.com/";

const TIME_DELTA_FOR_KEY = new BN(60 * 60);

const FactoryErc721 = artifacts.require('FactoryErc721');
const FactoryErc1155 = artifacts.require('FactoryErc1155');
const ERC721Main = artifacts.require('ERC721Main');
const ERC1155Main = artifacts.require('ERC1155Main');

contract(
    'Asset-test',
    ([
        Factory721Deployer,
        Factory1155Deployer,
        Nft721Deployer,
        Nft1155Deployer,
        user1,
        user2
    ]) => {
        let FactoryErc721Inst;
        let FactoryErc1155Inst;
        let ERC721MainInst;
        let ERC1155MainInst;

        let Factory721Signer;
        let Factory1155Signer;
        let Nft721Signer;
        let Nft1155Signer;

        beforeEach(async () => {
            // Init contracts
            FactoryErc721Inst = await FactoryErc721.new(
                { from: Factory721Deployer }
            );
            Factory721Signer = EthCrypto.createIdentity();
            await FactoryErc721Inst.grantRole(await FactoryErc721Inst.SIGNER_ROLE(), Factory721Signer.address, { from: Factory721Deployer });

            FactoryErc1155Inst = await FactoryErc1155.new(
                { from: Factory1155Deployer }
            );
            Factory1155Signer = EthCrypto.createIdentity();
            await FactoryErc1155Inst.grantRole(await FactoryErc1155Inst.SIGNER_ROLE(), Factory1155Signer.address, { from: Factory1155Deployer });

            Nft721Signer = EthCrypto.createIdentity();
            Nft1155Signer = EthCrypto.createIdentity();
        })

        it("#0 Deploy ERC721 token", async () => {
            const message = EthCrypto.hash.keccak256([
                { type: "address", value: Nft721Signer.address }
            ]);
            const signature = EthCrypto.sign(Factory721Signer.privateKey, message);

            await expectRevert(
                FactoryErc721Inst.makeERC721(
                    NFT_721_NAME,
                    NFT_721_SYMBOL,
                    NFT_721_BASE_URI,
                    user1,
                    signature,
                    { from: user1 }
                ),
                "FactoryErc721: Signer should sign transaction"
            );

            let tx = await FactoryErc721Inst.makeERC721(
                NFT_721_NAME,
                NFT_721_SYMBOL,
                NFT_721_BASE_URI,
                Nft721Signer.address,
                signature,
                { from: user1 }
            );
            ERC721MainInst = tx.logs[2].args.newToken;
            assert(ERC721MainInst != ZERO_ADDRESS);
            ERC721MainInst = await ERC721Main.at(ERC721MainInst);

            expect(await ERC721MainInst.name()).to.be.equals(NFT_721_NAME);
            expect(await ERC721MainInst.symbol()).to.be.equals(NFT_721_SYMBOL);
            expect(await ERC721MainInst.baseURI()).to.be.equals(NFT_721_BASE_URI);
            expect(await ERC721MainInst.factory()).to.be.equals(FactoryErc721Inst.address);
        })

        it("#1 Deploy ERC1155 token", async () => {
            const message = EthCrypto.hash.keccak256([
                { type: "address", value: Nft1155Signer.address }
            ]);
            const signature = EthCrypto.sign(Factory1155Signer.privateKey, message);

            await expectRevert(
                FactoryErc1155Inst.makeERC1155(
                    NFT_1155_BASE_URI,
                    user1,
                    signature,
                    { from: user1 }
                ),
                "FactoryErc1155: Signer should sign transaction"
            );

            let tx = await FactoryErc1155Inst.makeERC1155(
                NFT_1155_BASE_URI,
                Nft1155Signer.address,
                signature,
                { from: user1 }
            );
            ERC1155MainInst = tx.logs[2].args.newToken;
            assert(ERC1155MainInst != ZERO_ADDRESS);
            ERC1155MainInst = await ERC1155Main.at(ERC1155MainInst);

            expect(await ERC1155MainInst.uri(ZERO)).to.be.equals(NFT_1155_BASE_URI);
            expect(await ERC1155MainInst.factory()).to.be.equals(FactoryErc1155Inst.address);
        })
    }
)
