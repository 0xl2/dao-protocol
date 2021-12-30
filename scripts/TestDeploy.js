const { ethers } = require("hardhat");
const fs = require('fs');
const keyConfig = require('../config/config.json');

async function main() {
    const daySec = 86400;
    const epochLength = "200" // need to update
    const firstEpochNumber = "1";

    const blockNumber = (await ethers.provider.getBlock()).number;

    const daiMint = ethers.utils.parseUnits("100000".toString(), 'ether');
    const prismMint = ethers.utils.parseUnits("10000", 'gwei');

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const DAI = await ethers.getContractFactory("DAI")
    const dai = await DAI.deploy(1337)
    await dai.deployed()

    await dai.connect(deployer).mint(deployer.address, daiMint);

    const Authority = await ethers.getContractFactory("OlympusAuthority")
    const authority = await Authority.deploy(deployer.address, deployer.address, deployer.address, deployer.address)
    await authority.deployed()

    const Prism = await ethers.getContractFactory("PrismERC20");
    const prism = await Prism.deploy(authority.address, keyConfig.prism_wallet);
    await prism.deployed()

    // mint prism to test account
    await prism.connect(deployer).mint(deployer.address, prismMint);

    const Rainbow = await ethers.getContractFactory("RainbowERC20");
    const rainbow = await Rainbow.deploy();
    await rainbow.deployed()

    const OlympusTreasury = await ethers.getContractFactory("OlympusTreasury");
    const olympusTreasury = await OlympusTreasury.deploy(prism.address, dai.address, dai.address, "0")
    await olympusTreasury.deployed()
    
    const Staking = await ethers.getContractFactory("OlympusStaking");
    const staking = await Staking.deploy(
        prism.address,
        rainbow.address,
        epochLength,
        firstEpochNumber,
        blockNumber
    );
    await staking.deployed();

    // Initialize Rnbw
    await rainbow.setIndex("0");
    await rainbow.initialize(staking.address);

    const Distributor = await ethers.getContractFactory("Distributor");
    const distributor = await Distributor.deploy(
        olympusTreasury.address,
        prism.address,
        epochLength,
        blockNumber
    );
    await distributor.deployed();

    // await prism.connect(deployer).mint(distributor.address, prismMint);
    await staking.connect(deployer).setContract(0, distributor.address);

    // warmup contract
    const StakingWarmup = await ethers.getContractFactory("StakingWarmup");
    const stakingWarmup = await StakingWarmup.deploy(staking.address, rainbow.address);
    await stakingWarmup.deployed();

    // initialize warmup
    await staking.connect(deployer).setWarmup(0);
    await staking.connect(deployer).setContract(1, stakingWarmup.address);

    // this is required to distribute
    await authority.pushVault(olympusTreasury.address, true);

    const PrismLock = await ethers.getContractFactory("PrismLock");
    const prismLock = await PrismLock.deploy(rainbow.address);
    await prismLock.deployed();
    
    await prismLock.setPenalty(10000); // set penalty 10%
    await prismLock.addLockUnit(daySec * 14, 115);
    await prismLock.addLockUnit(daySec * 30, 130);
    await prismLock.addLockUnit(daySec * 90, 150);
    await prismLock.addLockUnit(daySec * 180, 200);

    const StakingHelper = await ethers.getContractFactory("StakingHelper");
    const stakingHelper = await StakingHelper.deploy(
        staking.address, 
        prismLock.address, 
        prism.address
    );
    await stakingHelper.deployed();

    await staking.connect(deployer).setContract(2, prismLock.address);
    await prismLock.connect(deployer).setHelper(stakingHelper.address);

    const BondCalculator = await ethers.getContractFactory("BondCalculator")
    const bondCalculator = await BondCalculator.deploy(prism.address)
    await bondCalculator.deployed()

    const RedeemHelper = await ethers.getContractFactory("RedeemHelper")
    const redeemHelper = await RedeemHelper.deploy()
    await redeemHelper.deployed()

    const DaiBond = await ethers.getContractFactory("OlympusBondDepository")
    const daiBond = await DaiBond.deploy(
        prism.address,
        // pairDaiOHM,
        dai.address,
        olympusTreasury.address,
        staking.address,
        ethers.constants.AddressZero
        // bondCalculator.address
    );
    await daiBond.deployed();

    await olympusTreasury.connect(deployer).queue(0, daiBond.address);
    await olympusTreasury.connect(deployer).toggle(0, daiBond.address, daiBond.address);

    // very important for bonding depository
    const maxPayout = 10000; // -> 1000 max if 100k prism minted
    await daiBond.initializeBondTerms(
        742, // control variable
        33110, // vesting term -> 33110 on mainnet
        1, // minimum price
        maxPayout, // maxpayout
        10000, // fee
        ethers.utils.parseUnits("1000000".toString(), 'ether'), // maxdebt
        ethers.utils.parseUnits("0.004".toString(), 'ether') // initialdebt -> totaldebt
    );

    // set buy/sell fee
    await prism.connect(deployer).setPercent(5000);

const config = `DAI_BOND_DEPOSITORY: "${daiBond.address}",
DAI_ADDRESS: "${dai.address}",
OHM_ADDRESS: "${prism.address}",
SOHM_ADDRESS: "${rainbow.address}",
STAKING_ADDRESS: "${staking.address}",
STAKING_HELPER_ADDRESS: "${stakingHelper.address}",
BONDINGCALC_ADDRESS: "${bondCalculator.address}",
TREASURY_ADDRESS: "${olympusTreasury.address}",
REDEEM_HELPER_ADDRESS: "${redeemHelper.address}",
PRISM_LOCKER: "${prismLock.address}",
DISTRIBUTOR: "${distributor.address}",
`
    fs.writeFileSync('./config/local-deploy.txt', config)

const config1 = `{"DAI_BOND_DEPOSITORY": "${daiBond.address}",
"DAI_ADDRESS": "${dai.address}",
"OHM_ADDRESS": "${prism.address}",
"SOHM_ADDRESS": "${rainbow.address}",
"STAKING_ADDRESS": "${staking.address}",
"STAKING_HELPER_ADDRESS": "${stakingHelper.address}",
"BONDINGCALC_ADDRESS": "${bondCalculator.address}",
"TREASURY_ADDRESS": "${olympusTreasury.address}",
"REDEEM_HELPER_ADDRESS": "${redeemHelper.address}",
"PRISM_LOCKER": "${prismLock.address}",
"DISTRIBUTOR": "${distributor.address}"
}`
    
    fs.writeFileSync('./config/local-deploy.json', config1)
}

main()
.then(() => process.exit())
.catch((error) => {
    console.error(error);
    process.exit(1);
});
