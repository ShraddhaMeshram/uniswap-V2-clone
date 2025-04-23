// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";

contract TestERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);

    constructor(string memory _name, string memory _symbol, uint _initialSupply) {
        name = _name;
        symbol = _symbol;
        _mint(msg.sender, _initialSupply);
    }

    function _mint(address to, uint value) internal {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }

    function approve(address spender, uint value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint value) external returns (bool) {
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint value) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint).max) {
            allowance[from][msg.sender] -= value;
        }
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
        return true;
    }
}

contract DeployTestTokens is Script {
    function run() public {
        vm.startBroadcast();

        // Create test tokens with 1 million supply each
        TestERC20 tokenA = new TestERC20("Token A", "TKNA", 1_000_000 * 10**18);
        TestERC20 tokenB = new TestERC20("Token B", "TKNB", 1_000_000 * 10**18);
        TestERC20 tokenC = new TestERC20("Token C", "TKNC", 1_000_000 * 10**18);

        console.log("Token A deployed at:", address(tokenA));
        console.log("Token B deployed at:", address(tokenB));
        console.log("Token C deployed at:", address(tokenC));

        vm.stopBroadcast();

        // ✅ Updated path to match frontend import
        string memory path = string.concat("web-ui/src/addresses/tokenAddresses_", vm.toString(block.chainid), ".json");

        string memory json = string.concat(
            '{"TOKEN_A":"', vm.toString(address(tokenA)),
            '","TOKEN_B":"', vm.toString(address(tokenB)),
            '","TOKEN_C":"', vm.toString(address(tokenC)), '"}'
        );

        vm.writeFile(path, json);
    }
}
