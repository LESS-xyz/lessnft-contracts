// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/AccessControl.sol";

import "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";
import "openzeppelin-solidity/contracts/token/ERC1155/IERC1155.sol";
import "openzeppelin-solidity/contracts/token/ERC1155/IERC1155Receiver.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract Vault is AccessControl, IERC721Receiver, IERC1155Receiver {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    event Erc721Income(address who, address token, uint256 id);
    event Erc721Outcome(
        address who,
        address manager,
        address token,
        uint256 id
    );

    event Erc1155Income(address who, address token, uint256 id, uint256 amount);
    event Erc1155Outcome(
        address who,
        address manager,
        address token,
        uint256 id,
        uint256 amount
    );

    event Erc20Income(address who, address token, uint256 amount);
    event Erc20Outcome(
        address who,
        address manager,
        address token,
        uint256 amount
    );

    event EthIncome(address who, uint256 amount);
    event EthOutcome(
        address who,
        address manager,
        uint256 amount
    );

    modifier onlyManager {
        require(
            hasRole(MANAGER_ROLE, _msgSender()),
            "Vault: Sender is not manager"
        );
        _;
    }

    constructor() {
        _setupRole(MANAGER_ROLE, _msgSender());
    }

    function erc721Fund(IERC721 token, uint256 id) external {
        address sender = _msgSender();
        token.transferFrom(sender, address(this), id);

        emit Erc721Income(sender, address(token), id);
    }

    function erc1155Fund(
        IERC1155 token,
        uint256 id,
        uint256 amount
    ) external {
        require(amount > 0, "Vault: Wrong amount");
        address sender = _msgSender();
        token.safeTransferFrom(sender, address(this), id, amount, "");

        emit Erc1155Income(sender, address(token), id, amount);
    }

    function erc20Fund(IERC20 token, uint256 amount) external {
        require(amount > 0, "Vault: Wrong amount");
        address sender = _msgSender();
        token.transferFrom(sender, address(this), amount);

        emit Erc20Income(sender, address(token), amount);
    }

    function ercFund() external payable {
        require(msg.value > 0, "Vault: Wrong value");

        emit EthIncome(_msgSender(), msg.value);
    }

    function erc721Withdraw(
        IERC721 token,
        uint256 id,
        address who
    ) external onlyManager {
        address manager = _msgSender();
        token.transferFrom(address(this), who, id);

        emit Erc721Outcome(who, manager, address(token), id);
    }

    function erc1155Withdraw(
        IERC1155 token,
        uint256 id,
        uint256 amount,
        address who
    ) external onlyManager {
        address manager = _msgSender();
        token.safeTransferFrom(address(this), who, id, amount, "");

        emit Erc1155Outcome(who, manager, address(token), id, amount);
    }

    function erc20Withdraw(
        IERC20 token,
        uint256 amount,
        address who
    ) external onlyManager {
        address manager = _msgSender();
        token.transfer(who, amount);

        emit Erc20Outcome(who, manager, address(token), amount);
    }

    function ethWithdraw(
        address payable who,
        uint256 amount
    ) external onlyManager {
        who.transfer(amount);

        emit EthOutcome(who, _msgSender(), amount);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external override pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external override pure returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external override pure returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }
}
