const { ethers } = require("hardhat");
const fs = require('fs');
const keyConfig = require('../config/config.json');

async function main() {
    const daySec = 86400;
    const epochLength = "200" // need to update
    const firstEpochNumber = "1";

    const userAddr = "0x9f5D1Dcf5367E5D6d2eCD9670046358854D1FF01";

    const blockNumber = (await ethers.provider.getBlock()).number;

    const daiMint = ethers.utils.parseUnits("50000".toString(), 'ether');
    const prismMint = ethers.utils.parseUnits("5000", 'gwei');

    const [deployer] = await ethers.getSigners();
    const deployerAddr = deployer.address;
    console.log("Deploying contracts with the account: " + deployerAddr);

    // const DAI = await ethers.getContractFactory("DAI")
    // const dai = await DAI.deploy(43113)
    // await dai.deployed()
    // const daiAddr = dai.address;

    // console.log(daiAddr, "daiAddr")

    // await dai.connect(deployer).mint(deployerAddr, daiMint);
    // await dai.connect(deployer).mint(userAddr, daiMint);

    const daiAddr = "0x26c8ad67cc099CBbc0077be7Fe01766582c17272";

    const Authority = await ethers.getContractFactory("OlympusAuthority")
    const authority = await Authority.deploy(deployerAddr, deployerAddr, deployerAddr, deployerAddr)
    await authority.deployed()
    const authorityAddr = authority.address;

    console.log(authorityAddr, "authorityAddr")

    const Prism = await ethers.getContractFactory("PrismERC20");
    const prism = await Prism.deploy(authorityAddr, keyConfig.prism_wallet);
    await prism.deployed()
    const prismAddr = prism.address;

    console.log(prismAddr, "prismAddr")

    // mint prism to test account
    await prism.connect(deployer).mint(deployerAddr, prismMint);
    await prism.connect(deployer).mint(userAddr, prismMint);

    // set buy/sell fee
    await prism.connect(deployer).setPercent(0, 100);
    await prism.connect(deployer).setPercent(1, 100);

    const Rainbow = await ethers.getContractFactory("RainbowERC20");
    const rainbow = await Rainbow.deploy();
    await rainbow.deployed()
    const rainbowAddr = rainbow.address;

    console.log(rainbowAddr, "rainbowAddr")

    const OlympusTreasury = await ethers.getContractFactory("OlympusTreasury");
    const olympusTreasury = await OlympusTreasury.deploy(prismAddr, daiAddr, daiAddr, "0")
    await olympusTreasury.deployed()
    const treasuryAddr = olympusTreasury.address;

    console.log(treasuryAddr, "treasuryAddr")

    await olympusTreasury.connect(deployer).setReward(prismAddr);

    const Staking = await ethers.getContractFactory("OlympusStaking");
    const staking = await Staking.deploy(
        prismAddr,
        rainbowAddr,
        epochLength,
        firstEpochNumber,
        blockNumber
    );
    await staking.deployed();
    const stakingAddr = staking.address;

    console.log(stakingAddr, "stakingAddr")

    // Initialize Rnbw
    await rainbow.setIndex("7675210820");
    await rainbow.initialize(stakingAddr);

    const Distributor = await ethers.getContractFactory("Distributor");
    const distributor = await Distributor.deploy(
        treasuryAddr,
        prismAddr,
        epochLength,
        blockNumber
    );
    await distributor.deployed();
    const distributorAddr = distributor.address;

    console.log(distributorAddr, "distributorAddr")

    // await prism.connect(deployer).mint(distributorAddr, prismMint);
    await staking.connect(deployer).setContract(0, distributorAddr);

    // warmup contract
    const StakingWarmup = await ethers.getContractFactory("StakingWarmup");
    const stakingWarmup = await StakingWarmup.deploy(stakingAddr, rainbowAddr);
    await stakingWarmup.deployed();
    const warmupAddr = stakingWarmup.address;

    console.log(warmupAddr, "warmupAddr");

    // initialize warmup
    await staking.connect(deployer).setWarmup(0);
    await staking.connect(deployer).setContract(1, warmupAddr);

    // this is required to distribute
    await authority.pushVault(treasuryAddr, true);

    const PrismLock = await ethers.getContractFactory("PrismLock");
    const prismLock = await PrismLock.deploy(rainbowAddr, treasuryAddr);
    await prismLock.deployed();
    const lockAddr = prismLock.address;

    console.log(lockAddr, "lockAddr");
    
    await prismLock.setPenalty(10000); // set penalty 10%
    await prismLock.addLockUnit(daySec * 14, 115);
    await prismLock.addLockUnit(daySec * 30, 130);
    await prismLock.addLockUnit(daySec * 90, 150);
    await prismLock.addLockUnit(daySec * 180, 200);

    await prismLock.addLockUnit(300, 115);
    await prismLock.addLockUnit(420, 150);
    await prismLock.addLockUnit(600, 200);
    
    // set lock to treasury
    await olympusTreasury.setLocker(lockAddr);

    const StakingHelper = await ethers.getContractFactory("StakingHelper");
    const stakingHelper = await StakingHelper.deploy(
        stakingAddr, 
        lockAddr, 
        prismAddr
    );
    await stakingHelper.deployed();
    const helperAddr = stakingHelper.address;

    console.log(helperAddr, "helperAddr");

    await staking.connect(deployer).setContract(2, lockAddr);
    await prismLock.connect(deployer).setHelper(helperAddr);

    const BondCalculator = await ethers.getContractFactory("BondCalculator")
    const bondCalculator = await BondCalculator.deploy(prismAddr)
    await bondCalculator.deployed()
    const bondCalcAddr = bondCalculator.address;
    
    console.log(bondCalcAddr, "bondCalculator");

    const RedeemHelper = await ethers.getContractFactory("RedeemHelper")
    const redeemHelper = await RedeemHelper.deploy()
    await redeemHelper.deployed()
    const redeemAddr = redeemHelper.address

    console.log(redeemAddr, "redeemHelper");

    const DaiBond = await ethers.getContractFactory("OlympusBondDepository")
    const daiBond = await DaiBond.deploy(
        prismAddr,
        // pairDaiOHM,
        daiAddr,
        treasuryAddr,
        stakingAddr,
        ethers.constants.AddressZero
        // bondCalcAddr
    );
    await daiBond.deployed();
    const daiBondAddr = daiBond.address

    console.log(daiBondAddr, "daiBond");

    await olympusTreasury.connect(deployer).queue(0, daiBondAddr);
    await olympusTreasury.connect(deployer).toggle(0, daiBondAddr, daiBondAddr);

    console.log("111")

    // very important for bonding depository
    const maxPayout = 30; // -> 1000 max if 100k prism minted
    const payFee = 10000; // 10000 -> 10%
    await daiBond.initializeBondTerms(
        13000, // control variable
        50, // vesting term -> 33110 on mainnet
        28572, // minimum price
        maxPayout, // maxpayout
        payFee, // fee
        ethers.utils.parseUnits("1000000".toString(), 'ether'), // maxdebt
        ethers.utils.parseUnits("0", 'ether') // initialdebt -> totaldebt
    );

    console.log("222")

    await daiBond.setAdjustment(
        false,
        300,
        10000,
        100
    );

    console.log("333")

    const config = `DAI_BOND_DEPOSITORY: "${daiBondAddr}",
DAI_ADDRESS: "${daiAddr}",
OHM_ADDRESS: "${prismAddr}",
SOHM_ADDRESS: "${rainbowAddr}",
STAKING_ADDRESS: "${stakingAddr}",
STAKING_HELPER_ADDRESS: "${helperAddr}",
BONDINGCALC_ADDRESS: "${bondCalcAddr}",
TREASURY_ADDRESS: "${treasuryAddr}",
REDEEM_HELPER_ADDRESS: "${redeemAddr}",
PRISM_LOCKER: "${lockAddr}",
DISTRIBUTOR: "${distributorAddr}",
`
    fs.writeFileSync('./config/fuji-deploy.txt', config)

const config1 = `{"DAI_BOND_DEPOSITORY": "${daiBondAddr}",
"DAI_ADDRESS": "${daiAddr}",
"OHM_ADDRESS": "${prismAddr}",
"SOHM_ADDRESS": "${rainbowAddr}",
"STAKING_ADDRESS": "${stakingAddr}",
"STAKING_HELPER_ADDRESS": "${helperAddr}",
"BONDINGCALC_ADDRESS": "${bondCalcAddr}",
"TREASURY_ADDRESS": "${treasuryAddr}",
"REDEEM_HELPER_ADDRESS": "${redeemAddr}",
"PRISM_LOCKER": "${lockAddr}",
"DISTRIBUTOR": "${distributorAddr}"
}`

    fs.writeFileSync('./config/fuji-deploy.json', config1)
}

main()
.then(() => process.exit())
.catch((error) => {
    console.error(error);
    process.exit(1);
});
