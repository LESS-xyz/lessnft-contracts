// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/AccessControl.sol";
import "openzeppelin-solidity/contracts/security/ReentrancyGuard.sol";
import "openzeppelin-solidity/contracts/utils/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";
import "openzeppelin-solidity/contracts/token/ERC1155/IERC1155.sol";
import "openzeppelin-solidity/contracts/token/ERC1155/IERC1155Receiver.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract Exchange is
    AccessControl,
    IERC721Receiver,
    IERC1155Receiver,
    ReentrancyGuard
{
    using SafeMath for uint256;

    struct NftTokenInfo {
        address tokenAddress;
        uint256 id;
        uint256 amount;
    }

    bytes32 public SIGNER_ROLE = keccak256("SIGNER_ROLE");

    event ExchangeMadeErc721(
        address seller,
        address buyer,
        NftTokenInfo sellToken,
        NftTokenInfo buyToken,
        address[] feeAddresses,
        uint256[] feeAmounts
    );
    event ExchangeMadeErc1155(
        address seller,
        address buyer,
        NftTokenInfo sellToken,
        NftTokenInfo buyToken,
        address[] feeAddresses,
        uint256[] feeAmounts
    );

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(SIGNER_ROLE, _msgSender());
    }

    function makeExchangeERC721(
        bytes32 idOrder,
        address whoIsSelling,
        NftTokenInfo calldata tokenToBuy,
        NftTokenInfo calldata tokenToSell,
        address[] calldata feeAddresses,
        uint256[] calldata feeAmounts,
        bytes calldata signature
    ) external nonReentrant {
        address sender = _msgSender();
        require(
            tokenToBuy.tokenAddress != address(0) && tokenToBuy.amount == 0,
            "Exchange: Wrong tokenToBuy"
        );
        require(
            tokenToSell.tokenAddress != address(0) && tokenToSell.id == 0,
            "Exchange: Wrong tokenToSell"
        );
        require(
            feeAddresses.length == feeAmounts.length,
            "Exchange: Wrong fees"
        );
        _verifySigner(
            idOrder,
            whoIsSelling,
            tokenToBuy,
            tokenToSell,
            feeAddresses,
            feeAmounts,
            sender,
            signature
        );

        IERC721(tokenToBuy.tokenAddress).safeTransferFrom(
            whoIsSelling,
            sender,
            tokenToBuy.id
        );

        uint256 tokenToSeller = tokenToSell.amount;
        for (uint256 i = 0; i < feeAddresses.length; i = i.add(1)) {
            tokenToSeller = tokenToSeller.sub(uint256(feeAmounts[i]));
            IERC20(tokenToSell.tokenAddress).transferFrom(
                sender,
                address(feeAddresses[i]),
                uint256(feeAmounts[i])
            );
        }
        IERC20(tokenToSell.tokenAddress).transferFrom(
            sender,
            whoIsSelling,
            tokenToSeller
        );

        emit ExchangeMadeErc721(
            whoIsSelling,
            sender,
            tokenToBuy,
            tokenToSell,
            feeAddresses,
            feeAmounts
        );
    }

    function makeExchangeERC1155(
        bytes32 idOrder,
        address whoIsSelling,
        NftTokenInfo calldata tokenToBuy,
        NftTokenInfo calldata tokenToSell,
        address[] calldata feeAddresses,
        uint256[] calldata feeAmounts,
        bytes calldata signature
    ) external nonReentrant {
        address sender = _msgSender();
        require(
            tokenToBuy.tokenAddress != address(0),
            "Exchange: Wrong tokenToBuy"
        );
        require(
            tokenToSell.tokenAddress != address(0) && tokenToSell.id == 0,
            "Exchange: Wrong tokenToSell"
        );
        require(
            feeAddresses.length == feeAmounts.length,
            "Exchange: Wrong fees"
        );
        _verifySigner(
            idOrder,
            whoIsSelling,
            tokenToBuy,
            tokenToSell,
            feeAddresses,
            feeAmounts,
            sender,
            signature
        );

        IERC1155(tokenToBuy.tokenAddress).safeTransferFrom(
            whoIsSelling,
            sender,
            tokenToBuy.id,
            tokenToBuy.amount,
            ""
        );

        uint256 tokenToSeller = tokenToSell.amount;
        for (uint256 i = 0; i < feeAddresses.length; i = i.add(1)) {
            tokenToSeller = tokenToSeller.sub(feeAmounts[i]);
            IERC20(tokenToSell.tokenAddress).transferFrom(
                sender,
                feeAddresses[i],
                feeAmounts[i]
            );
        }

        IERC20(tokenToSell.tokenAddress).transferFrom(
            sender,
            whoIsSelling,
            tokenToSeller
        );

        emit ExchangeMadeErc1155(
            whoIsSelling,
            sender,
            tokenToBuy,
            tokenToSell,
            feeAddresses,
            feeAmounts
        );
    }

    function _verifySigner(
        bytes32 idOrder,
        address whoIsSelling,
        NftTokenInfo calldata tokenToBuy,
        NftTokenInfo calldata tokenToSell,
        address[] calldata feeAddresses,
        uint256[] calldata feeAmounts,
        address whoIsBuying,
        bytes calldata signature
    ) private view {
        bytes memory message =
            abi.encodePacked(
                idOrder,
                whoIsSelling,
                tokenToBuy.tokenAddress,
                tokenToBuy.id,
                tokenToBuy.amount
            );
        message = abi.encodePacked(
            message,
            tokenToSell.tokenAddress,
            //tokenToSell.id,
            tokenToSell.amount,
            feeAddresses,
            feeAmounts,
            whoIsBuying
        );
        address messageSigner = ECDSA.recover(keccak256(message), signature);
        require(
            hasRole(SIGNER_ROLE, messageSigner),
            "Exchange: Signer should sign transaction"
        );
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
