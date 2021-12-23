const { ethers } = require("hardhat");

describe.only("Staking test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("get sohm", async() => {
        try {
            const blockNumber = (await ethers.provider.getBlock()).number;
            const stakeAddress = "0xC9e221e1cf3eFBeD2FEcbBCf705c68E45B88A13a";
            const sOHMAdress = "0x48F9Efc1C89DC80f9aA51778C93FAe09373bD81C"
            const helperAddress = "0xF2cE89fa77c519b48Ff172b1355a66FfB2Ab0b23"

            const sOHM = await ethers.getContractAt("sOlympus", sOHMAdress);
            const stakingHelper = await ethers.getContractAt("StakingHelper", helperAddress);
            const stakingContract = await ethers.getContractAt("OlympusStaking", stakeAddress);
            
            // const Staking = await ethers.getContractFactory("OlympusStaking");
            // const ohmAddress = "0x19f9bc336A2c6fB25474ae313B5f7B64c7F69d58";
            // const stakingContract = await Staking.deploy(
            //     ohmAddress,
            //     sOHMAdress,
            //     "2200",
            //     blockNumber,
            //     blockNumber
            // );
            // await stakingContract.deployed();

            console.log(await sOHM.callStatic.stakingContract(), "stakingContract")
            console.log(await sOHM.callStatic.balanceOf(stakeAddress), "stakingContract")
            console.log(await sOHM.callStatic.totalSupply(), "totalSupply");
            console.log(await sOHM.callStatic.circulatingSupply(), "circulatingSupply");
            console.log(await stakingContract.callStatic.contractBalance(), "contractBalance");

            // await stakingContract.setContract(0, ethers.constants.AddressZero)
            // await stakingContract.connect(deployer).setWarmup(0);
            // console.log(await stakingHelper.connect(deployer).callStatic.stake(ethers.utils.parseUnits("20", "gwei")));
            // console.log(await stakingContract.callStatic.rebase());
            const epoch = await stakingContract.callStatic.epoch();
            console.log(epoch, blockNumber);
            // const info = await stakingContract.callStatic.warmupInfo(deployer.address);
            // console.log(info.expiry);
        } catch(err) {
            console.log(err);
        }
    })
});
