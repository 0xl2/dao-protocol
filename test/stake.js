const { ethers } = require("hardhat");

describe("Staking test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("get sohm", async() => {
        try {
            const blockNumber = (await ethers.provider.getBlock()).number;
            const stakeAddress = "0xe5bCCA69642AA34efD96596A4BA9f9BA7F9E3787";
            const sOHMAdress = "0x800023c32c60Ff44CCD524c9fe7A11A8B13085Aa"
            const helperAddress = "0xaA727FFB2716a2a1a41b0fcdf025283A8f49dE52"
            const lockAddress = "0xC35949Ddc305A8945775401cd1d46F9487B8F17C";

            const dayinSec = 86400;

            const sOHM = await ethers.getContractAt("sOlympus", sOHMAdress);
            const stakingHelper = await ethers.getContractAt("StakingHelper", helperAddress);
            const stakingContract = await ethers.getContractAt("OlympusStaking", stakeAddress);
            const lockContract = await ethers.getContractAt("PrismLock", lockAddress);
            
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

            const amount = ethers.utils.parseUnits("200", "gwei");
            console.log(await lockContract.callStatic.lockUnits(dayinSec * 14))
            console.log(await lockContract.callStatic.estimateAmount(dayinSec * 14, amount))

            // await stakingContract.setContract(0, ethers.constants.AddressZero)
            // await stakingContract.connect(deployer).setWarmup(0);
            console.log(await stakingHelper.connect(deployer).callStatic.stake(amount, 1209600));
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
