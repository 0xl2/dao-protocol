const { ethers } = require("hardhat");

describe("CreatePair test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("Get address from createPair", async() => {
        const DAI = await ethers.getContractFactory("DAI")
        const dai = await DAI.deploy(43113)
        await dai.deployed()

        const OldOHM = await ethers.getContractFactory("OldOlympusERC20Token")
        const oldOHM = await OldOHM.deploy()
        await oldOHM.deployed()

        const UniFactory = await ethers.getContractFactory("UniswapV2Factory")
        const uniFactory = await UniFactory.deploy(deployer.address)
        await uniFactory.deployed()

        const Authority = await ethers.getContractFactory("OlympusAuthority")
        const authority = await Authority.deploy(deployer.address, deployer.address, deployer.address, deployer.address)
        await authority.deployed()

        const OHM = await ethers.getContractFactory("OlympusERC20Token");
        const ohm = await OHM.deploy(authority.address);
        await ohm.deployed()

        const BondCalculator = await ethers.getContractFactory("OlympusBondingCalculator")
        const bondCalculator = await BondCalculator.deploy(ohm.address)
        await bondCalculator.deployed()
        
        try {
            const pairDaiOOHM = await uniFactory.callStatic.createPair(dai.address, oldOHM.address)
            console.log("Pair address: " + pairDaiOOHM)

            const markdownVal = await bondCalculator.markdown(pairDaiOOHM)
            console.log("Markdown: " + markdownVal)
        } catch(err) {
            console.log(err);
        }
    })
});
