const { ethers } = require("hardhat");

describe("Staking test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("get sohm", async() => {
        try {
            const blockNumber = (await ethers.provider.getBlock()).number;
            const stakeAddress = "0xD24707Da401497e83a7d03d0F31a97575c0e3949";
            const sOHMAdress = "0x9c6C5C98eC859185463A17b65536e955f91CF9EB"
            const helperAddress = "0xcc2C9e342b81200f0739713772566a4dF4b6e38E"
            const lockAddress = "0x9919591851167Ca9FC3ac575004deb6EBEC9DC10";
            const distributAddr = "0x897472a3E1Ac93813cb25Ab1eD639960BcF4C94a";

            const dayinSec = 86400;

            const sOHM = await ethers.getContractAt("RainbowERC20", sOHMAdress);
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
            // await stakingContract.setContract(0, ethers.constants.AddressZero)
            // await stakingContract.connect(deployer).setWarmup(0);

            // const distributor = await ethers.getContractAt("StakingDistributor", distributAddr);
            const Distributor = await ethers.getContractFactory("StakingDistributor");
            const distributor = await Distributor.deploy();
            await distributor.deployed();

            await distributor.connect(deployer).setStaking(stakeAddress);
            await distributor.connect(deployer).setRewardRate(50);

            console.log(await distributor.callStatic.distribute(), "distribute");

            // console.log(await sOHM.callStatic.stakingContract(), "stakingContract")
            // console.log(await sOHM.callStatic.balanceOf(stakeAddress), "stakingContract")
            // console.log(await sOHM.callStatic.totalSupply(), "totalSupply");
            // console.log(await sOHM.callStatic.circulatingSupply(), "circulatingSupply");
            // console.log(await stakingContract.callStatic.contractBalance(), "contractBalance");

            // const amount = ethers.utils.parseUnits("200", "gwei");
            // console.log(await lockContract.callStatic.lockUnits(dayinSec * 14), "lockUnits")
            // console.log(await lockContract.callStatic.estimateAmount(dayinSec * 14, amount), "estimateAmount")

            // console.log(await stakingHelper.connect(deployer).callStatic.stake(amount, 1209600));
            // console.log(await stakingContract.callStatic.rebase());
            // const epoch = await stakingContract.callStatic.rebase();
            // console.log(epoch, blockNumber);
            // const info = await stakingContract.callStatic.warmupInfo(deployer.address);
            // console.log(info.expiry);
        } catch(err) {
            console.log(err);
        }
    })
});
