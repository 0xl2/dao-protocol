const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    const initVal = 1;
    const epochLength = "1" // need to update
    const firstEpochNumber = "550";
    const firstBlockNumber = "9505000";

    const daiMintVal = 100000;

    const daiMint = ethers.utils.parseUnits(daiMintVal.toString(), 'ether');
    const prismMint = ethers.utils.parseUnits("10000", 'gwei');

    const daiPair = ethers.utils.parseUnits("10000", 'ether');
    const prismPair = ethers.utils.parseUnits("1000", 'gwei');

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const DAI = await ethers.getContractFactory("DAI")
    const dai = await DAI.deploy(1337)
    await dai.deployed()

    await dai.connect(deployer).mint(deployer.address, daiMint);

    const OldPrism = await ethers.getContractFactory("OldPrismERC20Token")
    const oldPrism = await OldPrism.deploy()
    await oldPrism.deployed()

    const OldRainbow = await ethers.getContractFactory("OldRainbow")
    const oldRainbow = await OldRainbow.deploy()
    await oldRainbow.deployed()

    const OldStaking = await ethers.getContractFactory("OldOlympusStaking")
    const oldStaking = await OldStaking.deploy(
        oldPrism.address,
        oldRainbow.address,
        epochLength,
        firstEpochNumber,
        firstBlockNumber
    )
    await oldStaking.deployed()

    const OldWSOHM = await ethers.getContractFactory("OldWOHM")
    const oldWSOHM = await OldWSOHM.deploy(oldRainbow.address)
    await oldWSOHM.deployed()

    const OldTreasury = await ethers.getContractFactory("OldOlympusTreasury")
    const oldTreasury = await OldTreasury.deploy(oldPrism.address, dai.address, 0)
    await oldTreasury.deployed()

    const Authority = await ethers.getContractFactory("OlympusAuthority")
    const authority = await Authority.deploy(deployer.address, deployer.address, deployer.address, deployer.address)
    await authority.deployed()

    const PrismWallet = await ethers.getContractFactory("PrismWallet");
    const prismWallet = await PrismWallet.deploy();
    await prismWallet.deployed();

    const Prism = await ethers.getContractFactory("PrismERC20Token");
    const prism = await Prism.deploy(authority.address, prismWallet.address);
    await prism.deployed()

    // mint prism to test account
    await prism.connect(deployer).mint(deployer.address, prismMint)

    const Rainbow = await ethers.getContractFactory("RainbowERC20");
    const rainbow = await Rainbow.deploy();
    await rainbow.deployed()

    const WSOHM = await ethers.getContractFactory("wOHM");
    const wsOHM = await WSOHM.deploy(rainbow.address)
    await wsOHM.deployed()

    const OlympusTreasury = await ethers.getContractFactory("OlympusTreasury");
    const olympusTreasury = await OlympusTreasury.deploy(prism.address, dai.address, dai.address, "0")
    await olympusTreasury.deployed()
    
    const blockNumber = (await ethers.provider.getBlock()).number;
    const Staking = await ethers.getContractFactory("OlympusStaking");
    const staking = await Staking.deploy(
        prism.address,
        rainbow.address,
        "2200",
        blockNumber,
        blockNumber
    );
    await staking.deployed();

    // distributor contract
    const Distributor = await ethers.getContractFactory("Distributor");
    const distributor = await Distributor.deploy(
        olympusTreasury.address,
        prism.address,
        staking.address,
        authority.address
    );
    await distributor.deployed()

    // warmup contract
    const StakingWarmup = await ethers.getContractFactory("StakingWarmup");
    const stakingWarmup = await StakingWarmup.deploy(staking.address, rainbow.address);
    await stakingWarmup.deployed();

    // initialize warmup
    await staking.connect(deployer).setWarmup(0);
    // await staking.connect(deployer).setContract(0, distributor.address);
    await staking.connect(deployer).setContract(1, stakingWarmup.address);

    await prism.connect(deployer).mint(staking.address, ethers.utils.parseUnits(initVal.toString(), 'gwei'))
    await authority.pushVault(olympusTreasury.address, true);

    const UniFactory = await ethers.getContractFactory("UniswapV2Factory")
    const uniFactory = await UniFactory.deploy(deployer.address)
    await uniFactory.deployed()
    // const uniFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    // const uniFactory = await ethers.getContractAt("UniswapV2Factory", uniFactoryAddress)

    // console.log(await uniFactory.callStatic.getHash())

    // create pair dai/prism, dai/old_prism
    await uniFactory.createPair(dai.address, oldPrism.address)
    await uniFactory.createPair(dai.address, prism.address)

    // const uniFacotry1 = await ethers.getContractAt("UniswapV2Factory",uniFactory.address);
    const pairDaiPrism = await uniFactory.getPair(dai.address, prism.address);
    const pairDaiOPrism = await uniFactory.getPair(dai.address, oldPrism.address);

    console.log(pairDaiOPrism, pairDaiPrism);

    const WETHToken = await ethers.getContractFactory("WETHToken")
    const wethToken = await WETHToken.deploy()
    await wethToken.deployed()

    const UniRouter = await ethers.getContractFactory("UniswapV2Router02")
    const uniRouter = await UniRouter.deploy(uniFactory.address, wethToken.address)
    await uniRouter.deployed()
    // const uniRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    // const sushiRouterAddress = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
    
    const Migrator = await ethers.getContractFactory("OlympusTokenMigrator");
    const migrator = await Migrator.deploy(
        oldPrism.address,
        oldRainbow.address,
        oldTreasury.address,
        oldStaking.address,
        oldWSOHM.address,
        uniRouter.address,
        uniRouter.address,
        "0",
        authority.address
    );
    await migrator.deployed()

    const migratorAddress = migrator.address;
    await oldTreasury.connect(deployer).queue(1, migratorAddress);
    await oldTreasury.connect(deployer).queue(3, migratorAddress);
    await oldTreasury.connect(deployer).queue(6, migratorAddress);
    await oldTreasury.connect(deployer).queue(2, pairDaiOPrism);
    await oldTreasury.connect(deployer).queue(2, pairDaiPrism);

    await oldTreasury.connect(deployer).toggle(1, migratorAddress, migratorAddress);
    await oldTreasury.connect(deployer).toggle(3, migratorAddress, migratorAddress);
    await oldTreasury.connect(deployer).toggle(6, migratorAddress, migratorAddress);
    await oldTreasury.connect(deployer).toggle(2, pairDaiOPrism, pairDaiOPrism);
    await oldTreasury.connect(deployer).toggle(2, pairDaiPrism, pairDaiPrism);

    await olympusTreasury.connect(deployer).queue(0, migratorAddress);
    await olympusTreasury.connect(deployer).toggle(0, migratorAddress, migratorAddress);

    await olympusTreasury.connect(deployer).queue(2, pairDaiPrism);
    await olympusTreasury.connect(deployer).toggle(2, pairDaiPrism, pairDaiPrism);

    // await olympusTreasury.connect(deployer).enable(5, dai.address, dai.address);

    const GOHM = await ethers.getContractFactory("gOHM");
    const gOHM = await GOHM.deploy(migratorAddress, rainbow.address)
    await gOHM.deployed()

    await migrator.migrateContracts(olympusTreasury.address, staking.address, prism.address, dai.address);
    // add liquidity to the pool
    // console.log(await migrator.callStatic.migrateLP(pairDaiOPrism, false, dai.address, ethers.utils.parseUnits("10", 'ether'), ethers.utils.parseUnits("10", 'ether')));
    
    // Initialize Rnbw
    await rainbow.setIndex("0");
    await rainbow.initialize(staking.address);

    const PrismLock = await ethers.getContractFactory("PrismLock");
    const prismLock = await PrismLock.deploy(rainbow.address);
    await prismLock.deployed();
    
    const daySec = 86400;
    await prismLock.setPenalty(10000); // set penalty 10%
    await prismLock.addLockUnit(daySec * 14, 115);
    await prismLock.addLockUnit(daySec * 30, 115);
    await prismLock.addLockUnit(daySec * 90, 115);
    await prismLock.addLockUnit(daySec * 180, 115);

    const StakingHelper = await ethers.getContractFactory("StakingHelper");
    const stakingHelper = await StakingHelper.deploy(staking.address, prismLock.address, prism.address);
    await stakingHelper.deployed();

    await staking.connect(deployer).setContract(2, prismLock.address);
    await prismLock.connect(deployer).setHelper(stakingHelper.address);

    const BondCalculator = await ethers.getContractFactory("OlympusBondingCalculator")
    const bondCalculator = await BondCalculator.deploy(prism.address)
    await bondCalculator.deployed()

    const RedeemHelper = await ethers.getContractFactory("RedeemHelper")
    const redeemHelper = await RedeemHelper.deploy()
    await redeemHelper.deployed()

    const BondDepository = await ethers.getContractFactory("OlympusBondDepository")
    const bondDepository = await BondDepository.deploy(
        prism.address,
        // pairDaiOHM,
        dai.address,
        olympusTreasury.address,
        rainbow.address,
        ethers.constants.AddressZero
        // bondCalculator.address
    );
    await bondDepository.deployed();

    await olympusTreasury.connect(deployer).queue(0, bondDepository.address);
    await olympusTreasury.connect(deployer).toggle(0, bondDepository.address, bondDepository.address);

    await dai.approve(uniRouter.address, daiPair);
    await prism.approve(uniRouter.address, prismPair);
    await uniRouter.addLiquidity(
        dai.address,
        prism.address,
        daiPair, 
        prismPair,
        ethers.utils.parseUnits("10", 'ether'), 
        ethers.utils.parseUnits("10", 'gwei'),
        bondDepository.address,
        (await ethers.provider.getBlock()).timestamp + 12000
    );
    
    // very important for bonding depository
    const daiVal = daiMintVal + initVal;
    await bondDepository.initializeBondTerms(ethers.utils.parseUnits("1", 'gwei'), 10000, 100, 1000, 500, daiVal, daiVal);

const config = `DAI_BOND_DEPOSITORY: "${bondDepository.address}",
DAI_ADDRESS: "${dai.address}",
PRISM_ADDRESS: "${prism.address}",
RAINBOW_ADDRESS: "${rainbow.address}",
STAKING_ADDRESS: "${staking.address}",
STAKING_HELPER_ADDRESS: "${stakingHelper.address}",
OLD_STAKING_ADDRESS: "${oldStaking.address}",
OLD_RAINBOW_ADDRESS: "${oldRainbow.address}",
BONDINGCALC_ADDRESS: "${bondCalculator.address}",
TREASURY_ADDRESS: "${olympusTreasury.address}",
REDEEM_HELPER_ADDRESS: "${redeemHelper.address}",
PRISM_LOCKER: "${prismLock.address}",
WSOHM_ADDRESS: "${wsOHM.address}",
GOHM_ADDRESS: "${gOHM.address}",
MIGRATOR_ADDRESS: "${migratorAddress}",
DAI_OLD_PRISM_PAIR: "${pairDaiOPrism}",
DAI_PRISM_PAIR: "${pairDaiPrism}",
DISTRIBUTOR: "${distributor.address}",
UNI_FACTOR: "${uniFactory.address}",
UNI_FOUTER: "${uniRouter.address}",
`
    
    fs.writeFileSync('./config/local-deploy.txt', config)
}

main()
.then(() => process.exit())
.catch((error) => {
    console.error(error);
    process.exit(1);
});
