// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/AccessControl.sol";
import "openzeppelin-solidity/contracts/utils/cryptography/ECDSA.sol";

import "./ERC1155Main.sol";
import "./exchange-provider/ExchangeProvider.sol";

contract FactoryErc1155 is AccessControl, ExchangeProvider {
    bytes32 public SIGNER_ROLE = keccak256("SIGNER_ROLE");
    string private CONTRACT_URI;

    event ERC1155Made(address newToken, address indexed signer);

    constructor(address _exchange, string memory _CONTRACT_URI) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(SIGNER_ROLE, _msgSender());
        exchange = _exchange;
        CONTRACT_URI = _CONTRACT_URI;
    }

    function makeERC1155(
        string memory name,
        string memory uri,
        address signer,
        bytes calldata signature
    ) external {
        _verifySigner(signer, signature);
        ERC1155Main newAddress = new ERC1155Main(name, uri, CONTRACT_URI, signer);

        emit ERC1155Made(address(newAddress), signer);
    }

    function _verifySigner(address signer, bytes calldata signature)
        private
        view
    {
        address messageSigner =
            ECDSA.recover(keccak256(abi.encodePacked(signer)), signature);
        require(
            hasRole(SIGNER_ROLE, messageSigner),
            "FactoryErc1155: Signer should sign transaction"
        );
    }
}
