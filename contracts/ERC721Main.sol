// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./openzeppelin/ERC721Burnable.sol";
import "./openzeppelin/ERC721Enumerable.sol";
import "./openzeppelin/ERC721URIStorage.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract ERC721Main is ERC721Burnable, ERC721Enumerable, ERC721URIStorage, Ownable {
    string public baseURI;

    constructor() {}

    function init(string memory _name, string memory _symbol, string memory baseURI_) external onlyOwner {
        ERC721.init(_name, _symbol);
        baseURI = baseURI_;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721, ERC721Enumerable) {
        ERC721._beforeTokenTransfer(from, to, tokenId);
        ERC721Enumerable._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        ERC721URIStorage._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return ERC721.supportsInterface(interfaceId)
            || ERC721Enumerable.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    function mint(address to, uint256 tokenId, string memory _tokenURI) external onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}