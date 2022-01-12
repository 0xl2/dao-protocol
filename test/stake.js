const { ethers } = require("hardhat");
const { ConsoleLogger } = require("ts-generator/dist/logger");
const keyConfig = require('../config/fuji-deploy.json');

describe("Staking test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("get sohm", async() => {
        try {
            const dayinSec = 86400;
            const blockNumber = (await ethers.provider.getBlock()).number;

            // const sOHM = await ethers.getContractAt("RainbowERC20", keyConfig.SOHM_ADDRESS);
            // const stakingHelper = await ethers.getContractAt("StakingHelper", keyConfig.STAKING_HELPER_ADDRESS);
            
            // const stakingContract = await ethers.getContractAt("OlympusStaking", keyConfig.STAKING_ADDRESS);
            // const lockContract = await ethers.getContractAt("PrismLock", keyConfig.PRISM_LOCKER);
            // const distributor = await ethers.getContractAt("Distributor", keyConfig.DISTRIBUTOR);

            // this is for mainnet
            const stakingContract = await ethers.getContractAt("OlympusStaking", "0xfd31c7d00ca47653c6ce64af53c1571f9c36566a");
            console.log(await stakingContract.callStatic.warmupPeriod(), "warmupPeriod");

            const distributor = await ethers.getContractAt("Distributor", "0xc58e923bf8a00e4361fe3f4275226a543d7d3ce6");
            console.log(await distributor.callStatic.adjustments(0), "adjustments");
            console.log(await distributor.callStatic.adjustments(6), "adjustments:1");
            console.log(await distributor.callStatic.info(0), "info");
            console.log(await distributor.callStatic.epochLength(), "epochLength");
            
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
            // const Distributor = await ethers.getContractFactory("StakingDistributor");
            // const distributor = await Distributor.deploy();
            // await distributor.deployed();

            // await distributor.connect(deployer).setStaking(stakeAddress);
            // await distributor.connect(deployer).setRewardRate(50);

            // console.log(await distributor.callStatic.distribute(), "distribute");

            // console.log(await sOHM.callStatic.stakingContract(), "stakingContract")
            // console.log(await sOHM.callStatic.balanceOf(stakeAddress), "stakingContract")
            // console.log(await sOHM.callStatic.totalSupply(), "totalSupply");
            // console.log(await sOHM.callStatic.circulatingSupply(), "circulatingSupply");
            // console.log(await stakingContract.callStatic.contractBalance(), "contractBalance");

            // const amount = ethers.utils.parseUnits("200", "gwei");
            // console.log(await lockContract.callStatic.getLock(), "getLock")
            // console.log(await distributor.callStatic.adjustments(0), "adjustments");

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
