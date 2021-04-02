// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "./ERC1155Main.sol";

contract FactoryErc1155 is Ownable {
    event ERC1155Made(
        address newToken,
        string name,
        string symbol,
        address newOwner
    );

    constructor() {}

    function makeERC1155(string memory name, string memory symbol, string memory uri, address owner) external {
        ERC1155Main newAddress = new ERC1155Main();

        newAddress.init(name, symbol, uri);
        newAddress.transferOwnership(owner);

        emit ERC1155Made(
            address(newAddress),
            name,
            symbol,
            owner
        );
    }
}