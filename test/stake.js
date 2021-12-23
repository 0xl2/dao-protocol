const { ethers } = require("hardhat");

describe("Staking test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("get sohm", async() => {
        try {
            const stakingHelper = await ethers.getContractAt("StakingHelper", "0xF64b51C6C2aa7c5E8A280e3f6aADFCc671528E5b");
            const stakingContract = await ethers.getContractAt("OlympusStaking", "0xdBf586Bbe8f34c905A406656E2f37f2550f07A53");
            const sOHM = await ethers.getContractAt("sOlympus", "0xF4c5B717645107FC54ED858dd7b3114E98546a12");
            // console.log(await stakingContract.warmupContract());
            // console.log(await sOHM.balanceOf("0x3Ff3d54BFfF4e5A2906941C9532C0316ACA7bE71"));
            // await stakingContract.setContract(0, ethers.constants.AddressZero)
            await stakingContract.connect(deployer).setWarmup(0);
            console.log(await stakingHelper.connect(deployer).callStatic.stake(ethers.utils.parseUnits("50", "gwei")));
            // const epoch = await stakingContract.callStatic.epoch();
            const info = await stakingContract.callStatic.warmupInfo(deployer.address);
            console.log(info);
        } catch(err) {
            console.log(err);
        }
    })
});
