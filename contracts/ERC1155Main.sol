// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "openzeppelin-solidity/contracts/access/AccessControl.sol";
import "openzeppelin-solidity/contracts/utils/cryptography/ECDSA.sol";
import "./exchange-provider/IExchangeProvider.sol";
import "./ERC1155URIStorage.sol";

contract ERC1155Main is ERC1155Burnable, ERC1155URIStorage, AccessControl {
    bytes32 public SIGNER_ROLE = keccak256("SIGNER_ROLE");

    address public factory;

    constructor(string memory _baseUri, address signer) ERC1155("") {
        factory = _msgSender();
        _setBaseUri(_baseUri);
        _setupRole(DEFAULT_ADMIN_ROLE, signer);
        _setupRole(SIGNER_ROLE, signer);
    }

    function mint(
        uint256 id,
        uint256 amount,
        string calldata _tokenURI,
        bytes calldata signature
    ) external {
        _verifySigner(id, amount, signature);
        _mint(_msgSender(), id, amount, "");
        setApprovalForAll(IExchangeProvider(factory).exchange(), true);
        _markTokenId(id);
        _setTokenURI(id,_tokenURI);
    }

    function mint(
        uint256 id,
        uint256 amount,
        string calldata _tokenURI,
        bytes memory data,
        bytes calldata signature
    ) external {
        _verifySigner(id, amount, signature);
        _mint(_msgSender(), id, amount, data);
        setApprovalForAll(IExchangeProvider(factory).exchange(), true);
        _markTokenId(id);
        _setTokenURI(id,_tokenURI);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC1155)
        returns (bool)
    {
        return
            ERC1155.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC1155URIStorage)
        returns (string memory)
    {
        return ERC1155URIStorage.tokenURI(tokenId);
    }

    function _verifySigner(
        uint256 id,
        uint256 amount,
        bytes calldata signature
    ) private view {
        address signer =
            ECDSA.recover(
                keccak256(abi.encodePacked(this, id, amount)),
                signature
            );
        require(
            hasRole(SIGNER_ROLE, signer),
            "ERC1155Main: Signer should sign transaction"
        );
    }
}
