// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./openzeppelin/ERC1155/ERC1155Burnable.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract ERC1155Main is ERC1155Burnable, Ownable {
    address public factory;

    string private _name;
    string private _symbol;

    constructor() {
        factory = _msgSender();
    }

    bool private isInited = false;
    function init(string memory name_, string memory symbol_, string memory uri_) external onlyOwner {
        require(
            isInited == false,
            "ERC1155Main: Already initiated"
        );
        _name = name_;
        _symbol = symbol_;
        _setURI(uri_);
        isInited = true;
    }

    function mint(address account, uint256 id, uint256 amount) external onlyOwner {
        _mint(account, id, amount, "");
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data) external onlyOwner {
        _mint(account, id, amount, data);
    }

    function name() external view returns(string memory) {
        return _name;
    }

    function symbol() external view returns(string memory) {
        return _symbol;
    }
}