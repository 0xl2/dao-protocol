const { ethers } = require("hardhat");

describe("OHM transfer test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })
    
    it("OHM transfer", async() => {
        const ohmContract = await ethers.getContractAt("OlympusERC20Token", "0x19FEE4f4EB700d5890f43c687917f7e8704941cA");
        
        // Now you can call functions of the contract
        await ohmContract.connect(deployer).mint(deployer.address, 1e12);
    })
});
