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

const NFT_NAME = "Test NFT 1";
const NFT_SYMBOL = "test1";
const NFT_BASE_URI = "test.com/";

const TIME_DELTA_FOR_KEY = new BN(60 * 60);

const FactoryErc721 = artifacts.require('FactoryErc721');
const ERC721Main = artifacts.require('ERC721Main');

contract(
    'Asset-test',
    ([
        FactoryOwner,
        NftOwnerOwner,
        user1,
        user2
    ]) => {
        let FactoryErc721Inst;
        let ERC721MainInst;

        beforeEach(async () => {
            // Init contracts

            //await Asset.link(AssetLibInst, AssetLibInst.address);
            //await AssetOwner.link(AssetLib, Asset);
            /* AssetInst = await Asset.new(
                { from: AssetOwner }
            ); */

            FactoryErc721Inst = await FactoryErc721.new(
                { from: FactoryOwner }
            );

            let tx = await FactoryErc721Inst.makeERC721(
                NFT_NAME,
                NFT_SYMBOL,
                NFT_BASE_URI,
                NftOwnerOwner,
                { from: user1 }
            );
            ERC721MainInst = tx.logs[2].args.newToken;
            //console.log("tx.logs[2].args.newToken =", tx.logs[2].args.newToken);
            assert(ERC721MainInst != ZERO_ADDRESS);
            ERC721MainInst = await ERC721Main.at(ERC721MainInst);
        })

        it("#0 Deploy test", async () => {
            expect(await FactoryErc721Inst.owner()).to.be.equals(FactoryOwner);

            expect(await ERC721MainInst.name()).to.be.equals(NFT_NAME);
            expect(await ERC721MainInst.symbol()).to.be.equals(NFT_SYMBOL);
            expect(await ERC721MainInst.owner()).to.be.equals(NftOwnerOwner);
            expect(await ERC721MainInst.baseURI()).to.be.equals(NFT_BASE_URI);
        })
    }
)
