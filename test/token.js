const { ethers } = require("hardhat");
const {expect} = require('chai');
const locKey = require("../config/local-deploy.json");

describe("Prism/Rnbw check", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("bond depository test", async() => {
        const prism = await ethers.getContractAt("PrismERC20", locKey.OHM_ADDRESS);
        const rnbw = await ethers.getContractAt("RainbowERC20", locKey.SOHM_ADDRESS);
        const staking = await ethers.getContractAt("OlympusStaking", locKey.STAKING_ADDRESS);

        // const Rnbw = await ethers.getContractFactory("RainbowERC20");
        // const rnbw = await Rnbw.deploy();
        // await rnbw.deployed();
        // await rnbw.initialize(locKey.STAKING_ADDRESS);

        // await rnbw.setIndex(7675210820)

        console.log(await rnbw.callStatic.totalSupply(), "totalSupply");
        console.log(await rnbw.callStatic.stakingContract(), "stakingContract");
        console.log(await rnbw.callStatic.balanceOf(locKey.STAKING_ADDRESS), "balanceOf");
        console.log(await rnbw.callStatic.circulatingSupply(), "circulatingSupply");
        console.log(await rnbw.callStatic.INDEX(), "INDEX");
        // console.log(await rnbw.callStatic._gonsPerFragment(), "_gonsPerFragment"); // 0x0e69594bec44de15b4c2ebe687989a9b3bf716c1add27f08523c
    })
});
