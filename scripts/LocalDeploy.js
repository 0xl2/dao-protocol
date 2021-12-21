const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    const epochLength = "2200"
    const firstEpochNumber = "550";
    const firstBlockNumber = "9505000";

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const DAI = await ethers.getContractFactory("DAI")
    const dai = await DAI.deploy(1337)
    await dai.deployed()

    await dai.connect(deployer).mint(deployer.address, ethers.utils.parseUnits("1000", 'ether'));

    const OldOHM = await ethers.getContractFactory("OldOlympusERC20Token")
    const oldOHM = await OldOHM.deploy()
    await oldOHM.deployed()

    const OldSOHM = await ethers.getContractFactory("OldSOlympus")
    const oldSOHM = await OldSOHM.deploy()
    await oldSOHM.deployed()

    const OldStaking = await ethers.getContractFactory("OldOlympusStaking")
    const oldStaking = await OldStaking.deploy(
        oldOHM.address,
        oldSOHM.address,
        epochLength,
        firstEpochNumber,
        firstBlockNumber
    )
    await oldStaking.deployed()

    const OldWSOHM = await ethers.getContractFactory("OldWOHM")
    const oldWSOHM = await OldWSOHM.deploy(oldSOHM.address)
    await oldWSOHM.deployed()

    const OldTreasury = await ethers.getContractFactory("OldOlympusTreasury")
    const oldTreasury = await OldTreasury.deploy(oldOHM.address, dai.address, 0)
    await oldTreasury.deployed()

    const Authority = await ethers.getContractFactory("OlympusAuthority")
    const authority = await Authority.deploy(deployer.address, deployer.address, deployer.address, deployer.address)
    await authority.deployed()

    const OHM = await ethers.getContractFactory("OlympusERC20Token");
    const ohm = await OHM.deploy(authority.address);
    await ohm.deployed()

    // mint ohm to test account
    await ohm.connect(deployer).mint(deployer.address, 1e12)

    const SOHM = await ethers.getContractFactory("sOlympus");
    const sOHM = await SOHM.deploy();
    await sOHM.deployed()

    const WSOHM = await ethers.getContractFactory("wOHM");
    const wsOHM = await WSOHM.deploy(sOHM.address)
    await wsOHM.deployed()

    const OlympusTreasury = await ethers.getContractFactory("OlympusTreasury");
    const olympusTreasury = await OlympusTreasury.deploy(ohm.address, dai.address, dai.address, "0")
    await olympusTreasury.deployed()

    await authority.pushVault(olympusTreasury.address, true);

    const Staking = await ethers.getContractFactory("OlympusStaking");
    const staking = await Staking.deploy(
        ohm.address,
        sOHM.address,
        "2200",
        firstEpochNumber,
        firstBlockNumber
    );
    await staking.deployed();
    
    // initialize warmup
    await staking.connect(deployer).setWarmup(2);

    const UniFactory = await ethers.getContractFactory("UniswapV2Factory")
    const uniFactory = await UniFactory.deploy(deployer.address)
    await uniFactory.deployed()
    // const uniFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    // const uniFactory = await ethers.getContractAt("UniswapV2Factory", uniFactoryAddress)

    // console.log(await uniFactory.callStatic.getHash())

    // create pair dai/ohm, dai/old ohm
    await uniFactory.createPair(dai.address, oldOHM.address)
    await uniFactory.createPair(dai.address, ohm.address)

    // const uniFacotry1 = await ethers.getContractAt("UniswapV2Factory",uniFactory.address);
    const pairDaiOHM = await uniFactory.getPair(dai.address, ohm.address);
    const pairDaiOOHM = await uniFactory.getPair(dai.address, oldOHM.address);

    console.log(pairDaiOOHM, pairDaiOHM);

    const WETHToken = await ethers.getContractFactory("WETHToken")
    const wethToken = await WETHToken.deploy()
    await wethToken.deployed()

    const UniRouter = await ethers.getContractFactory("UniswapV2Router02")
    const uniRouter = await UniRouter.deploy(uniFactory.address, wethToken.address)
    await uniRouter.deployed()
    // const uniRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    // const sushiRouterAddress = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
    
    await dai.approve(uniRouter.address, ethers.utils.parseUnits("100", 'ether'));
    await ohm.approve(uniRouter.address, ethers.utils.parseUnits("10", 'gwei'));
    await uniRouter.addLiquidity(
        dai.address,
        ohm.address,
        ethers.utils.parseUnits("100", 'ether'), 
        ethers.utils.parseUnits("10", 'gwei'),
        ethers.utils.parseUnits("1", 'ether'), 
        ethers.utils.parseUnits("1", 'ether'),
        deployer.address,
        (await ethers.provider.getBlock()).timestamp + 12000
    );

    const Migrator = await ethers.getContractFactory("OlympusTokenMigrator");
    const migrator = await Migrator.deploy(
        oldOHM.address,
        oldSOHM.address,
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
    await oldTreasury.connect(deployer).queue(2, pairDaiOOHM);
    await oldTreasury.connect(deployer).queue(2, pairDaiOHM);

    await oldTreasury.connect(deployer).toggle(1, migratorAddress, migratorAddress);
    await oldTreasury.connect(deployer).toggle(3, migratorAddress, migratorAddress);
    await oldTreasury.connect(deployer).toggle(6, migratorAddress, migratorAddress);
    await oldTreasury.connect(deployer).toggle(2, pairDaiOOHM, pairDaiOOHM);
    await oldTreasury.connect(deployer).toggle(2, pairDaiOHM, pairDaiOHM);

    await olympusTreasury.connect(deployer).queue(0, migratorAddress);
    await olympusTreasury.connect(deployer).toggle(0, migratorAddress, migratorAddress);

    // await olympusTreasury.connect(deployer).enable(5, dai.address, dai.address);

    const GOHM = await ethers.getContractFactory("gOHM");
    const gOHM = await GOHM.deploy(migratorAddress, sOHM.address)
    await gOHM.deployed()

    await migrator.migrateContracts(olympusTreasury.address, staking.address, ohm.address, sOHM.address, dai.address)
    // add liquidity to the pool
    // console.log(await migrator.callStatic.migrateLP(pairDaiOOHM, false, dai.address, ethers.utils.parseUnits("10", 'ether'), ethers.utils.parseUnits("10", 'ether')));
    
    // Initialize sohm
    await sOHM.setIndex("0");
    // await sOHM.setgOHM(gOHM.address);
    await sOHM.initialize(staking.address);

    const Distributor = await ethers.getContractFactory("Distributor");
    const distributor = await Distributor.deploy(
        olympusTreasury.address,
        ohm.address,
        staking.address,
        authority.address
    );
    await distributor.deployed()

    const StakingHelper = await ethers.getContractFactory("StakingHelper")
    const stakingHelper = await StakingHelper.deploy(staking.address, ohm.address)
    await stakingHelper.deployed()

    const BondCalculator = await ethers.getContractFactory("OlympusBondingCalculator")
    const bondCalculator = await BondCalculator.deploy(ohm.address)
    await bondCalculator.deployed()

    const RedeemHelper = await ethers.getContractFactory("RedeemHelper")
    const redeemHelper = await RedeemHelper.deploy()
    await redeemHelper.deployed()

    const BondDepository = await ethers.getContractFactory("OlympusBondDepository")
    const bondDepository = await BondDepository.deploy(
        ohm.address,
        pairDaiOHM,
        olympusTreasury.address,
        sOHM.address,
        bondCalculator.address
    );
    await bondDepository.deployed();
    
    // very important for bonding depository
    await bondDepository.initializeBondTerms(100, 10000, 100, 1000, 500, 10000, 1000);

const config = `DAI_ADDRESS: "${dai.address}",
OHM_ADDRESS: "${ohm.address}",
STAKING_ADDRESS: "${staking.address}",
STAKING_HELPER_ADDRESS: "${stakingHelper.address}",
OLD_STAKING_ADDRESS: "${oldStaking.address}",
SOHM_ADDRESS: "${sOHM.address}",
OLD_SOHM_ADDRESS: "${oldSOHM.address}",
BONDINGCALC_ADDRESS: "${bondCalculator.address}",
TREASURY_ADDRESS: "${olympusTreasury.address}",
REDEEM_HELPER_ADDRESS: "${redeemHelper.address}",
WSOHM_ADDRESS: "${wsOHM.address}",
GOHM_ADDRESS: "${gOHM.address}",
MIGRATOR_ADDRESS: "${migratorAddress}",
DAI_BOND_DEPOSITORY: "${bondDepository.address}",
DAI_OLD_OHM_PAIR: "${pairDaiOOHM}",
DAI_OHM_PAIR: "${pairDaiOHM}",
UNI_FACTOR: "${uniFactory.address}",
UNI_FOUTER: "${uniRouter.address}",
`
    
    fs.writeFileSync('./config/local-deploy.js', config)
}

main()
.then(() => process.exit())
.catch((error) => {
    console.error(error);
    process.exit(1);
});
