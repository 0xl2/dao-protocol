const { ethers } = require("hardhat");

describe("Pair reserve test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("Get reserve from pair address and compare", async() => {
        try {
            const routerInst = await ethers.getContractAt("UniswapV2Pair", "0x3a106B6362bea194F42a25686a87D4AD04bA8AE7", deployer);
            console.log(await routerInst.callStatic.getReserves())
        } catch(err) {
            console.log(err);
        }
    })
});
