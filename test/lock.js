const { ethers } = require("hardhat");
const locKey = require("../config/fuji-deploy.json");

describe("Staking test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("get sohm", async() => {
        try {
            // const authority = await ethers.getContractAt("OlympusAuthority", "0xCD46934f45d04ebE1Abe4B6817874b664c8FA0e7");
            // console.log(await authority.vault(), "vault0");

            // const prism = await ethers.getContractAt("PrismERC20", locKey.OHM_ADDRESS);
            // const prismMint = ethers.utils.parseUnits("10000", 'gwei');
            // // await prism.connect(deployer).mint(deployer.address, prismMint);

            // console.log(await prism.callStatic.balanceOf(locKey.TREASURY_ADDRESS));

            // const dai = await ethers.getContractAt("DAI", locKey.DAI_ADDRESS)
            // const daiMint = ethers.utils.parseUnits("100000".toString(), 'ether');
            // await dai.connect(deployer).mint(deployer.address, daiMint);

            // console.log(await dai.callStatic.balanceOf(deployer.address));

            // const PrismLock = await ethers.getContractFactory("PrismLock");
            // const prismLock = await PrismLock.deploy(locKey.SOHM_ADDRESS, locKey.TREASURY_ADDRESS);
            // await prismLock.deployed();
            // const lockAddr = prismLock.address;

            // console.log(lockAddr, "lockAddr");

            // await prismLock.setPenalty(10000); // set penalty 10%
            // await prismLock.setReward(locKey.OHM_ADDRESS);

            // console.log("111");

            const prismLock = await ethers.getContractAt("PrismLock", locKey.PRISM_LOCKER);
            // await prismLock.connect(deployer).addLockUnit(60 * 5, 115);
            // await prismLock.connect(deployer).addLockUnit(60 * 7, 150);
            // await prismLock.connect(deployer).addLockUnit(60 * 10, 200);

            console.log(await prismLock.callStatic.userLocks(deployer.address), "userLocks");
            // console.log(await prismLock.callStatic.Treasury(), "Treasury");
            // console.log(await prismLock.callStatic.RewardToken(), "RewardToken");

            const treasury = await ethers.getContractAt("OlympusTreasury", locKey.TREASURY_ADDRESS);
            console.log(await treasury.callStatic.RewardToken(), "RewardToken");

            // console.log("222");

            // const StakingHelper = await ethers.getContractFactory("StakingHelper");
            // const stakingHelper = await StakingHelper.deploy(
            //     locKey.STAKING_ADDRESS, 
            //     lockAddr, 
            //     locKey.OHM_ADDRESS
            // );
            // await stakingHelper.deployed();
            // const helperAddr = stakingHelper.address;

            // console.log(helperAddr, "helperAddr");
            
            // const staking = await ethers.getContractAt("OlympusStaking", locKey.STAKING_ADDRESS);
            // await staking.connect(deployer).setContract(2, prismLock.address);
            // await prismLock.connect(deployer).setHelper(stakingHelper.address);

            const staking = await ethers.getContractAt("OlympusStaking", locKey.STAKING_ADDRESS);
            console.log(await staking.callStatic.locker());
            console.log(await staking.callStatic.warmupPeriod(), "warmupPeriod");

            const stakingHelper = await ethers.getContractAt("StakingHelper", locKey.STAKING_HELPER_ADDRESS)
            console.log(await stakingHelper.callStatic.OHM(), "ohm");
            console.log(await stakingHelper.callStatic.staking(), "staking");
            console.log(await stakingHelper.callStatic.locker(), "locker");

            // console.log("333");

            const rainbow = await ethers.getContractAt("RainbowERC20", locKey.SOHM_ADDRESS);
            console.log(await rainbow.callStatic.stakingContract(), "stakingContract");
            console.log(await rainbow.callStatic.balanceOf(locKey.PRISM_LOCKER), "Locker balance");
        } catch(err) {
            console.log(err);
        }
    })
});
