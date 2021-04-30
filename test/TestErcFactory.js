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

const DECIMALS = new BN(18);
const ONE_TOKEN = TEN.pow(DECIMALS);

const NFT_721_NAME = "Test NFT 1";
const NFT_721_SYMBOL = "test1";
const NFT_721_BASE_URI = "test.com/";

const NFT_1155_NAME = "Test NFT 1155 1";
const NFT_1155_SYMBOL = "test1 1155";
const NFT_1155_BASE_URI = "test1155.com/";

const FactoryErc721 = artifacts.require('FactoryErc721');
const FactoryErc1155 = artifacts.require('FactoryErc1155');
const ERC721Main = artifacts.require('ERC721Main');
const ERC1155Main = artifacts.require('ERC1155Main');
const Exchange = artifacts.require('Exchange');
const ERC20Test = artifacts.require('ERC20Test');

contract(
    'Asset-test',
    ([
        Factory721Deployer,
        Factory1155Deployer,
        ExchangeDeployer,
        ERC20Deployer,
        user1,
        user2,
        user3,
        feeRecipient1,
        feeRecipient2,
    ]) => {
        let FactoryErc721Inst;
        let FactoryErc1155Inst;
        let ERC721MainInst;
        let ERC1155MainInst;
        let ExchangeInst;
        let ERC20TestInst;

        let Factory721Signer;
        let Factory1155Signer;
        let Nft721Signer;
        let Nft1155Signer;
        let ExchangeSigner;

        let SIGNER_ROLE;

        beforeEach(async () => {
            // Init contracts
            ExchangeInst = await Exchange.new(
                { from: ExchangeDeployer }
            );
            SIGNER_ROLE = await ExchangeInst.SIGNER_ROLE();
            ExchangeSigner = EthCrypto.createIdentity();
            await ExchangeInst.grantRole(SIGNER_ROLE, ExchangeSigner.address, { from: ExchangeDeployer });

            FactoryErc721Inst = await FactoryErc721.new(
                ExchangeInst.address,
                { from: Factory721Deployer }
            );
            expect(await FactoryErc721Inst.SIGNER_ROLE()).to.be.equals(SIGNER_ROLE);
            Factory721Signer = EthCrypto.createIdentity();
            await FactoryErc721Inst.grantRole(await FactoryErc721Inst.SIGNER_ROLE(), Factory721Signer.address, { from: Factory721Deployer });

            FactoryErc1155Inst = await FactoryErc1155.new(
                { from: Factory1155Deployer }
            );
            expect(await FactoryErc1155Inst.SIGNER_ROLE()).to.be.equals(SIGNER_ROLE);
            Factory1155Signer = EthCrypto.createIdentity();
            await FactoryErc1155Inst.grantRole(SIGNER_ROLE, Factory1155Signer.address, { from: Factory1155Deployer });

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

            expect(await ERC721MainInst.exchange()).to.be.equals(ExchangeInst.address);
            expect(await ERC721MainInst.factory()).to.be.equals(FactoryErc721Inst.address);

            expect(await ERC721MainInst.SIGNER_ROLE()).to.be.equals(SIGNER_ROLE);

            expect(await ERC721MainInst.hasRole(SIGNER_ROLE, Nft721Signer.address)).to.be.equals(true);
            expect(await ERC721MainInst.hasRole(SIGNER_ROLE, user1)).to.be.equals(false);
            expect(await ERC721MainInst.hasRole(SIGNER_ROLE, FactoryErc721Inst.address)).to.be.equals(false);
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

            expect(await ERC1155MainInst.SIGNER_ROLE()).to.be.equals(SIGNER_ROLE);

            expect(await ERC1155MainInst.hasRole(SIGNER_ROLE, Nft1155Signer.address)).to.be.equals(true);
            expect(await ERC1155MainInst.hasRole(SIGNER_ROLE, user1)).to.be.equals(false);
            expect(await ERC1155MainInst.hasRole(SIGNER_ROLE, FactoryErc1155Inst.address)).to.be.equals(false);
        })

        it("#2 Test ERC721 token", async () => {
            let message = EthCrypto.hash.keccak256([
                { type: "address", value: Nft721Signer.address }
            ]);
            let signature = EthCrypto.sign(Factory721Signer.privateKey, message);

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

            message = EthCrypto.hash.keccak256([
                { type: "address", value: ERC721MainInst.address },
                { type: "uint256", value: ZERO.toString() }
            ]);
            signature = EthCrypto.sign(Nft721Signer.privateKey, message);

            await expectRevert(
                ERC721MainInst.mint(ONE, NFT_721_BASE_URI, signature, { from: user1 }),
                "ERC721Main: Signer should sign transaction"
            );
            await ERC721MainInst.mint(ZERO, NFT_721_BASE_URI, signature, { from: user1 });

            expect(await ERC721MainInst.balanceOf(user1)).to.be.bignumber.that.equals(ONE);
            expect(await ERC721MainInst.ownerOf(ZERO)).to.be.equals(user1);
            expect(await ERC721MainInst.getApproved(ZERO)).to.be.equals(ExchangeInst.address); // token approved to exchange by default

            let fakeSigner = EthCrypto.createIdentity();
            message = EthCrypto.hash.keccak256([
                { type: "address", value: ERC721MainInst.address },
                { type: "uint256", value: ONE.toString() }
            ]);
            signature = EthCrypto.sign(fakeSigner.privateKey, message);

            await expectRevert(
                ERC721MainInst.mint(ONE, NFT_721_BASE_URI, signature, { from: user1 }),
                "ERC721Main: Signer should sign transaction"
            );
        })

        it("#3 Test ERC1155 token", async () => {
            let message = EthCrypto.hash.keccak256([
                { type: "address", value: Nft1155Signer.address }
            ]);
            let signature = EthCrypto.sign(Factory1155Signer.privateKey, message);

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

            message = EthCrypto.hash.keccak256([
                { type: "address", value: ERC1155MainInst.address },
                { type: "uint256", value: ZERO.toString() },
                { type: "uint256", value: TEN.toString() }
            ]);
            signature = EthCrypto.sign(Nft1155Signer.privateKey, message);

            await expectRevert(
                ERC1155MainInst.mint(ONE, TEN, signature, { from: user1 }),
                "ERC1155Main: Signer should sign transaction"
            );
            await expectRevert(
                ERC1155MainInst.mint(ZERO, ONE, signature, { from: user1 }),
                "ERC1155Main: Signer should sign transaction"
            );
            await ERC1155MainInst.mint(ZERO, TEN, signature, { from: user1 });

            expect(await ERC1155MainInst.balanceOf(user1, ZERO)).to.be.bignumber.that.equals(TEN);

            let fakeSigner = EthCrypto.createIdentity();
            message = EthCrypto.hash.keccak256([
                { type: "address", value: ERC1155MainInst.address },
                { type: "uint256", value: ONE.toString() },
                { type: "uint256", value: TEN.toString() }
            ]);
            signature = EthCrypto.sign(fakeSigner.privateKey, message);

            await expectRevert(
                ERC1155MainInst.mint(ONE, TEN, signature, { from: user1 }),
                "ERC1155Main: Signer should sign transaction"
            );
        })

        it("#4 Test exchange ERC721", async () => {
            // deploy nft 721
            let message = EthCrypto.hash.keccak256([
                { type: "address", value: Nft721Signer.address }
            ]);
            let signature = EthCrypto.sign(Factory721Signer.privateKey, message);

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

            // deploy ERC20
            ERC20TestInst = await ERC20Test.new(
                { from: ERC20Deployer }
            );
            await ERC20TestInst.mint(ONE_TOKEN, { from: user2 });

            // mint token for user1
            message = EthCrypto.hash.keccak256([
                { type: "address", value: ERC721MainInst.address },
                { type: "uint256", value: ZERO.toString() }
            ]);
            signature = EthCrypto.sign(Nft721Signer.privateKey, message);
            await ERC721MainInst.mint(ZERO, NFT_721_BASE_URI, signature, { from: user1 });

            await ERC721MainInst.approve(ExchangeInst.address, ZERO, { from: user1 });
            await ERC20TestInst.approve(ExchangeInst.address, ONE_TOKEN, { from: user2 });

            let orderId = "0xe2f4eaae4a9751e85a3e4a7b9587827a877f29914755229b07a7b2da98285f70";

            let feeAddresses = [feeRecipient1, feeRecipient2];
            let feeAmount = [ONE_TOKEN.div(TEN).toString(), ONE_TOKEN.div(TEN.mul(TWO)).toString()];

            message = EthCrypto.hash.keccak256([
                { type: "bytes32", value: orderId },
                { type: "address", value: user1 },
                { type: "address", value: ERC721MainInst.address },
                { type: "uint256", value: ZERO.toString() },
                { type: "uint256", value: ZERO.toString() },
                { type: "address", value: ERC20TestInst.address },
                //{ type: "uint256", value: ZERO.toString() },
                { type: "uint256", value: ONE_TOKEN.toString() },
                { type: "address[]", value: feeAddresses },
                { type: "uint256[]", value: feeAmount },
                { type: "address", value: user2 },
            ]);
            signature = EthCrypto.sign(ExchangeSigner.privateKey, message);

            let invalidOrderId = "0x0000000000000000000000000000000000000000000000000000000000000000";

            await expectRevert(
                ExchangeInst.makeExchangeERC721(
                    invalidOrderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC721MainInst.address, id: ZERO, amount: ZERO },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC721(
                    orderId,
                    [ user2, user1 ],
                    { tokenAddress: ERC721MainInst.address, id: ZERO, amount: ZERO },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC721(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ZERO_ADDRESS, id: ZERO, amount: ZERO },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Wrong tokenToBuy"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC721(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC721MainInst.address, id: ONE.toString(), amount: ZERO },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC721(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC721MainInst.address, id: ZERO, amount: ONE.toString() },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Wrong tokenToBuy"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC721(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC721MainInst.address, id: ZERO, amount: ZERO },
                    { tokenAddress: ZERO_ADDRESS, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Wrong tokenToSell"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC721(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC721MainInst.address, id: ZERO, amount: ZERO },
                    { tokenAddress: ERC20TestInst.address, id: ONE.toString(), amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Wrong tokenToSell"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC721(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC721MainInst.address, id: ZERO, amount: ZERO },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.div(TWO).toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            let oldValue = feeAddresses[0];
            feeAddresses[0] = user1;
            await expectRevert(
                ExchangeInst.makeExchangeERC721(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC721MainInst.address, id: ZERO, amount: ZERO },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            feeAddresses[0] = oldValue;
            oldValue = feeAmount[0];
            feeAmount[0] = new BN(oldValue).div(TWO).toString();
            await expectRevert(
                ExchangeInst.makeExchangeERC721(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC721MainInst.address, id: ZERO, amount: ZERO },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            feeAmount[0] = oldValue;
            
            await expectRevert(
            	ExchangeInst.makeExchangeERC1155(
                	orderId,
                	[ user1, user3 ],
                	{ tokenAddress: ERC1155MainInst.address, id: ZERO, amount: TEN.toString() },
                	{ tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                	{ feeAddresses: feeAddresses, feeAmounts: feeAmount },
                	signature,
                	{ from: user2 }
            	),
            	"Exchange: Signer should sign transaction"
            );

            let user1ERC20BalanceBefore = await ERC20TestInst.balanceOf(user1);
            let user2ERC20BalanceBefore = await ERC20TestInst.balanceOf(user2);
            let feeRecipient1ERC20BalanceBefore = await ERC20TestInst.balanceOf(feeRecipient1);
            let feeRecipient2ERC20BalanceBefore = await ERC20TestInst.balanceOf(feeRecipient2);

            await ExchangeInst.makeExchangeERC721(
                orderId,
                [ user1, user2 ],
                { tokenAddress: ERC721MainInst.address, id: ZERO, amount: ZERO },
                { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                signature,
                { from: user2 }
            );

            let user1ERC20BalanceAfter = await ERC20TestInst.balanceOf(user1);
            let user2ERC20BalanceAfter = await ERC20TestInst.balanceOf(user2);
            let feeRecipient1ERC20BalanceAfter = await ERC20TestInst.balanceOf(feeRecipient1);
            let feeRecipient2ERC20BalanceAfter = await ERC20TestInst.balanceOf(feeRecipient2);

            expect(user1ERC20BalanceAfter.sub(user1ERC20BalanceBefore)).to.be.bignumber.that.equals(ONE_TOKEN.sub(new BN(feeAmount[0])).sub(new BN(feeAmount[1])));
            expect(user2ERC20BalanceBefore.sub(user2ERC20BalanceAfter)).to.be.bignumber.that.equals(ONE_TOKEN);
            expect(feeRecipient1ERC20BalanceAfter.sub(feeRecipient1ERC20BalanceBefore)).to.be.bignumber.that.equals(new BN(feeAmount[0]));
            expect(feeRecipient2ERC20BalanceAfter.sub(feeRecipient2ERC20BalanceBefore)).to.be.bignumber.that.equals(new BN(feeAmount[1]));

            expect(await ERC721MainInst.ownerOf(ZERO)).to.be.equals(user2);
        })

        it("#5 Test exchange ERC1155", async () => {
            // deploy nft 721
            let message = EthCrypto.hash.keccak256([
                { type: "address", value: Nft1155Signer.address }
            ]);
            let signature = EthCrypto.sign(Factory1155Signer.privateKey, message);

            let tx = await FactoryErc1155Inst.makeERC1155(
                NFT_1155_BASE_URI,
                Nft1155Signer.address,
                signature,
                { from: user1 }
            );
            ERC1155MainInst = tx.logs[2].args.newToken;
            assert(ERC1155MainInst != ZERO_ADDRESS);
            ERC1155MainInst = await ERC1155Main.at(ERC1155MainInst);

            // deploy ERC20
            ERC20TestInst = await ERC20Test.new(
                { from: ERC20Deployer }
            );
            await ERC20TestInst.mint(ONE_TOKEN, { from: user2 });

            // mint token for user1
            message = EthCrypto.hash.keccak256([
                { type: "address", value: ERC1155MainInst.address },
                { type: "uint256", value: ZERO.toString() },
                { type: "uint256", value: TEN.toString() }
            ]);
            signature = EthCrypto.sign(Nft1155Signer.privateKey, message);
            await ERC1155MainInst.mint(ZERO, TEN, signature, { from: user1 });

            await ERC1155MainInst.setApprovalForAll(ExchangeInst.address, true, { from: user1 });
            await ERC20TestInst.approve(ExchangeInst.address, ONE_TOKEN, { from: user2 });

            let orderId = "0xe2f4eaae4a9751e85a3e4a7b9587827a877f29914755229b07a7b2da98285f70";

            let feeAddresses = [feeRecipient1, feeRecipient2];
            let feeAmount = [ONE_TOKEN.div(TEN).toString(), ONE_TOKEN.div(TEN.mul(TWO)).toString()];

            message = EthCrypto.hash.keccak256([
                { type: "bytes32", value: orderId },
                { type: "address", value: user1 },
                { type: "address", value: ERC1155MainInst.address },
                { type: "uint256", value: ZERO.toString() },
                { type: "uint256", value: TEN.toString() },
                { type: "address", value: ERC20TestInst.address },
                //{ type: "uint256", value: ZERO.toString() },
                { type: "uint256", value: ONE_TOKEN.toString() },
                { type: "address[]", value: feeAddresses },
                { type: "uint256[]", value: feeAmount },
                { type: "address", value: user2 },
            ]);
            signature = EthCrypto.sign(ExchangeSigner.privateKey, message);

            let invalidOrderId = "0x0000000000000000000000000000000000000000000000000000000000000000";

            await expectRevert(
                ExchangeInst.makeExchangeERC1155(
                    invalidOrderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC1155MainInst.address, id: ZERO, amount: TEN.toString() },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC1155(
                    orderId,
                    [ user2, user1 ],
                    { tokenAddress: ERC1155MainInst.address, id: ZERO, amount: TEN.toString() },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC1155(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ZERO_ADDRESS, id: ZERO, amount: TEN.toString() },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Wrong tokenToBuy"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC1155(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC1155MainInst.address, id: ONE.toString(), amount: TEN.toString() },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC1155(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC1155MainInst.address, id: ZERO, amount: ONE.toString() },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC1155(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC1155MainInst.address, id: ZERO, amount: TEN.toString() },
                    { tokenAddress: ZERO_ADDRESS, id: ZERO, amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Wrong tokenToSell"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC1155(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC1155MainInst.address, id: ZERO, amount: TEN.toString() },
                    { tokenAddress: ERC20TestInst.address, id: ONE.toString(), amount: ONE_TOKEN.toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Wrong tokenToSell"
            );
            await expectRevert(
                ExchangeInst.makeExchangeERC1155(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC1155MainInst.address, id: ZERO, amount: TEN.toString() },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.div(TWO).toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            let oldValue = feeAddresses[0];
            feeAddresses[0] = user1;
            await expectRevert(
                ExchangeInst.makeExchangeERC1155(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC1155MainInst.address, id: ZERO, amount: TEN.toString() },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.div(TWO).toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            feeAddresses[0] = oldValue;
            oldValue = feeAmount[0];
            feeAmount[0] = new BN(oldValue).div(TWO).toString();
            await expectRevert(
                ExchangeInst.makeExchangeERC1155(
                    orderId,
                    [ user1, user2 ],
                    { tokenAddress: ERC1155MainInst.address, id: ZERO, amount: TEN.toString() },
                    { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.div(TWO).toString() },
                    { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                    signature,
                    { from: user2 }
                ),
                "Exchange: Signer should sign transaction"
            );
            feeAmount[0] = oldValue;
            
            await expectRevert(
            	ExchangeInst.makeExchangeERC1155(
                	orderId,
                	[ user1, user3 ],
                	{ tokenAddress: ERC1155MainInst.address, id: ZERO, amount: TEN.toString() },
                	{ tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                	{ feeAddresses: feeAddresses, feeAmounts: feeAmount },
                	signature,
                	{ from: user2 }
            	),
            	"Exchange: Signer should sign transaction"
            );

            let user1ERC20BalanceBefore = await ERC20TestInst.balanceOf(user1);
            let user2ERC20BalanceBefore = await ERC20TestInst.balanceOf(user2);
            let feeRecipient1ERC20BalanceBefore = await ERC20TestInst.balanceOf(feeRecipient1);
            let feeRecipient2ERC20BalanceBefore = await ERC20TestInst.balanceOf(feeRecipient2);

            await ExchangeInst.makeExchangeERC1155(
                orderId,
                [ user1, user2 ],
                { tokenAddress: ERC1155MainInst.address, id: ZERO, amount: TEN.toString() },
                { tokenAddress: ERC20TestInst.address, id: ZERO, amount: ONE_TOKEN.toString() },
                { feeAddresses: feeAddresses, feeAmounts: feeAmount },
                signature,
                { from: user2 }
            );

            let user1ERC20BalanceAfter = await ERC20TestInst.balanceOf(user1);
            let user2ERC20BalanceAfter = await ERC20TestInst.balanceOf(user2);
            let feeRecipient1ERC20BalanceAfter = await ERC20TestInst.balanceOf(feeRecipient1);
            let feeRecipient2ERC20BalanceAfter = await ERC20TestInst.balanceOf(feeRecipient2);

            expect(user1ERC20BalanceAfter.sub(user1ERC20BalanceBefore)).to.be.bignumber.that.equals(ONE_TOKEN.sub(new BN(feeAmount[0])).sub(new BN(feeAmount[1])));
            expect(user2ERC20BalanceBefore.sub(user2ERC20BalanceAfter)).to.be.bignumber.that.equals(ONE_TOKEN);
            expect(feeRecipient1ERC20BalanceAfter.sub(feeRecipient1ERC20BalanceBefore)).to.be.bignumber.that.equals(new BN(feeAmount[0]));
            expect(feeRecipient2ERC20BalanceAfter.sub(feeRecipient2ERC20BalanceBefore)).to.be.bignumber.that.equals(new BN(feeAmount[1]));

            expect(await ERC1155MainInst.balanceOf(user1, ZERO)).to.be.bignumber.that.equals(ZERO);
            expect(await ERC1155MainInst.balanceOf(user2, ZERO)).to.be.bignumber.that.equals(TEN);
        })
    }
)
