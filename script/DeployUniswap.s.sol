// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/Contracts/UniswapV2Factory.sol";
import "../src/periphery/UniswapV2Router02.sol";
import "../src/WETH9.sol";

contract DeployUniswap is Script {
    function run() public {
        vm.startBroadcast();
        
        // Deploy Factory
        UniswapV2Factory factory = new UniswapV2Factory(msg.sender);
        
        // Deploy WETH
        WETH9 weth = new WETH9();
        
        // Deploy Router
        UniswapV2Router02 router = new UniswapV2Router02(address(factory), address(weth));
        
        console.log("Factory deployed at:", address(factory));
        console.log("WETH deployed at:", address(weth));
        console.log("Router deployed at:", address(router));
        
        vm.stopBroadcast();

        string memory path = string.concat("web-ui/src/addresses/uniswapAddresses_", vm.toString(block.chainid), ".json");

        string memory json = string.concat(
        '{"FACTORY":"', vm.toString(address(factory)),
        '","WETH":"', vm.toString(address(weth)),
        '","ROUTER":"', vm.toString(address(router)), '"}'
        );

        vm.writeFile(path, json);

    }
}


