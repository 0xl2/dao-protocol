const { ethers } = require("hardhat");
const fs = require('fs');
const { expect } = require("chai");

async function main() {
    const epochLength = "2200"
    const firstEpochNumber = "550";
    const firstBlockNumber = "9505000";

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const DAI = await ethers.getContractFactory("DAI")
    const dai = await DAI.deploy(43113)
    await dai.deployed()

    // await dai.connect(deployer).mint(deployer.address, ethers.utils.parseUnits("1000", 'ether'));

    const OldOHM = await ethers.getContractFactory("OldOlympusERC20Token")
    const oldOHM = await OldOHM.deploy()
    await oldOHM.deployed()

    // const OldSOHM = await ethers.getContractFactory("OldSOlympus")
    // const oldSOHM = await OldSOHM.deploy()
    // await oldSOHM.deployed()

    // const OldStaking = await ethers.getContractFactory("OldOlympusStaking")
    // const oldStaking = await OldStaking.deploy(
    //     oldOHM.address,
    //     oldSOHM.address,
    //     epochLength,
    //     firstEpochNumber,
    //     firstBlockNumber
    // )
    // await oldStaking.deployed()

    // const OldWSOHM = await ethers.getContractFactory("OldWOHM")
    // const oldWSOHM = await OldWSOHM.deploy(oldSOHM.address)
    // await oldWSOHM.deployed()

    // const TimeLock = await ethers.getContractFactory("Timelock")
    // const timeLock = await TimeLock.deploy(deployer.address, 14 * 24 * 60 * 60)
    // await timeLock.deployed()

    // const uniRouter = "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106"

    // const OldTreasury = await ethers.getContractFactory("OldOlympusTreasury")
    // const oldTreasury = await OldTreasury.deploy(oldOHM.address, dai.address, 0)
    // await oldTreasury.deployed()
    
    // const Authority = await ethers.getContractFactory("OlympusAuthority")
    // const authority = await Authority.deploy(deployer.address, deployer.address, deployer.address, deployer.address)
    // await authority.deployed()

    // const OHM = await ethers.getContractFactory("OlympusERC20Token");
    // const ohm = await OHM.deploy(authority.address);
    // await ohm.deployed()

    // // mint ohm to test account
    // await ohm.connect(deployer).mint(deployer.address, 1e12)

    // const SOHM = await ethers.getContractFactory("sOlympus");
    // const sOHM = await SOHM.deploy();
    // await sOHM.deployed()

    // const WSOHM = await ethers.getContractFactory("wOHM");
    // const wsOHM = await WSOHM.deploy(sOHM.address)
    // await wsOHM.deployed()

    // const OlympusTreasury = await ethers.getContractFactory("OlympusTreasury");
    // const olympusTreasury = await OlympusTreasury.deploy(ohm.address, dai.address, dai.address, "0")
    // await olympusTreasury.deployed()

    // await authority.pushVault(olympusTreasury.address, true);

    // const Staking = await ethers.getContractFactory("OlympusStaking");
    // const staking = await Staking.deploy(
    //     ohm.address,
    //     sOHM.address,
    //     "2200",
    //     firstEpochNumber,
    //     firstBlockNumber
    // );
    // await staking.deployed();
    
    // // initialize warmup
    // await staking.connect(deployer).setWarmup(2);

    const UniFactory = await ethers.getContractFactory("UniswapV2Factory")
    const uniFactory = await UniFactory.deploy(deployer.address)
    await uniFactory.deployed()
    
    // create pair dai/ohm, dai/old ohm
    const pairDaiOOHM = await uniFactory.callStatic.createPair(dai.address, oldOHM.address)
    console.log(pairDaiOOHM);
    // const pairDaiOHM = await uniFactory.createPair(dai.address, ohm.address)

//     const Migrator = await ethers.getContractFactory("OlympusTokenMigrator");
//     const migrator = await Migrator.deploy(
//         oldOHM.address,
//         oldSOHM.address,
//         oldTreasury.address,
//         oldStaking.address,
//         oldWSOHM.address,
//         timeLock.address,
//         uniRouter,
//         "0",
//         authority.address
//     );
//     await migrator.deployed()

//     await migrator.migrateContracts(olympusTreasury.address, staking.address, ohm.address, sOHM.address, dai.address, pairDaiOHM.address)
//     await migrator.migrateLP(pairDaiOHM.address, false, dai.address, ethers.utils.parseUnits("10", 'ether'), ethers.utils.parseUnits("10", 'ether'));

//     const GOHM = await ethers.getContractFactory("gOHM");
//     const gOHM = await GOHM.deploy(migrator.address, sOHM.address)
//     await gOHM.deployed()

//     await migrator.setgOHM(gOHM.address);

//     // Initialize sohm
//     await sOHM.setIndex("7675210820");
//     // await sOHM.setgOHM(gOHM.address);
//     await sOHM.initialize(staking.address);

//     const Distributor = await ethers.getContractFactory("Distributor");
//     const distributor = await Distributor.deploy(
//         olympusTreasury.address,
//         ohm.address,
//         staking.address,
//         authority.address
//     );
//     await distributor.deployed()

//     const StakingHelper = await ethers.getContractFactory("StakingHelper")
//     const stakingHelper = await StakingHelper.deploy(staking.address, ohm.address)
//     await stakingHelper.deployed()

//     const BondCalculator = await ethers.getContractFactory("OlympusBondingCalculator")
//     const bondCalculator = await BondCalculator.deploy(ohm.address)
//     await bondCalculator.deployed()

//     const RedeemHelper = await ethers.getContractFactory("RedeemHelper")
//     const redeemHelper = await RedeemHelper.deploy()
//     await redeemHelper.deployed()

//     const BondDepository = await ethers.getContractFactory("OlympusBondDepository")
//     const bondDepository = await BondDepository.deploy(
//         ohm.address,
//         dai.address,
//         olympusTreasury.address,
//         sOHM.address,
//         bondCalculator.address
//     );
//     await bondDepository.deployed();

// const config = `DAI_ADDRESS: "${dai.address}",
// OHM_ADDRESS: "${ohm.address}",
// STAKING_ADDRESS: "${staking.address}",
// STAKING_HELPER_ADDRESS: "${stakingHelper.address}",
// OLD_STAKING_ADDRESS: "${oldStaking.address}",
// SOHM_ADDRESS: "${sOHM.address}",
// OLD_SOHM_ADDRESS: "${oldSOHM.address}",
// BONDINGCALC_ADDRESS: "${bondCalculator.address}",
// TREASURY_ADDRESS: "${olympusTreasury.address}",
// REDEEM_HELPER_ADDRESS: "${redeemHelper.address}",
// WSOHM_ADDRESS: "${wsOHM.address}",
// GOHM_ADDRESS: "${gOHM.address}",
// MIGRATOR_ADDRESS: "${migrator.address}",
// DAI_BIND_DEPOSITORY: "${bondDepository.address}",
// DAI_OLD_OHM_PAIR: "${pairDaiOHM.address}",
// UNI_FACTORU: "${uniFactory.address}"
// `
    
//     fs.writeFileSync('./config/local-deploy.js', config)
}

main()
.then(() => process.exit())
.catch((error) => {
    console.error(error);
    process.exit(1);
});
