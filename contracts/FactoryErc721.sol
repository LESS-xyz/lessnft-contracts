// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "./ERC721Main.sol";

contract FactoryErc721 is Ownable {
    event ERC721Made(
        address newToken,
        string name,
        string symbol,
        address newOwner
    );

    constructor() {}

    function makeERC721(string memory name, string memory symbol, string memory baseURI, address owner) external {
        ERC721Main newAddress = new ERC721Main();

        newAddress.init(name, symbol, baseURI);
        newAddress.transferOwnership(owner);

        emit ERC721Made(
            address(newAddress),
            name,
            symbol,
            owner
        );
    }
}