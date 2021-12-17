const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    const epochLength = "2200"
    const firstEpochNumber = "550";
    const firstBlockNumber = "9505000";

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const DAI = await ethers.getContractFactory("DAI")
    const dai = await DAI.deploy(43113)
    await dai.deployed()

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

    const TimeLock = await ethers.getContractFactory("Timelock")
    const timeLock = await TimeLock.deploy(deployer.address, 14 * 24 * 60 * 60)
    await timeLock.deployed()

    const uniRouter = "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106"

    const OldTreasury = await ethers.getContractFactory("OldOlympusTreasury")
    const oldTreasury = await OldTreasury.deploy(oldOHM.address, dai.address, 0)
    await oldTreasury.deployed()
    
    const Authority = await ethers.getContractFactory("OlympusAuthority")
    const authority = await Authority.deploy(deployer.address, deployer.address, deployer.address, deployer.address)
    await authority.deployed()

    const Migrator = await ethers.getContractFactory("OlympusTokenMigrator");
    const migrator = await Migrator.deploy(
        oldOHM.address,
        oldSOHM.address,
        oldTreasury.address,
        oldStaking.address,
        oldWSOHM.address,
        timeLock.address,
        uniRouter,
        // "0xdaD43B56dBB3AaA32f3B9de0Eb2987DdB1f0C10b",
        // "0x66494794825Cc04081aF23c99FF38077fb8CC2E0",
        // "0x75E89EB75E2c7d0A4D4b506Dffc66f67B8e720B9",
        // "0x0F1f56C22B9c65962e7727b7F7Ea34355D738A23",
        // "0x86731F3bEb236DB99ae7a96698F5eaD9F64659c8",
        // "0xA0C283F7C44Aa524810D055Bc5d7d428ce8d1BCd",
        // "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
        "0",
        authority.address
    );
    await migrator.deployed()

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

    const GOHM = await ethers.getContractFactory("gOHM");
    const gOHM = await GOHM.deploy(migrator.address, sOHM.address)
    await gOHM.deployed()

    await migrator.setgOHM(gOHM.address);
    
    // const daiAddr = "0xdBaFac57522481A7bC2CaBa0279a2B24e6C86ab5"
    // old treasury 0x75E89EB75E2c7d0A4D4b506Dffc66f67B8e720B9
    const OlympusTreasury = await ethers.getContractFactory("OlympusTreasury");
    // const olympusTreasury = await OlympusTreasury.deploy(ohm.address, daiAddr, daiAddr, "0")
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
    await staking.deployed()

    // Initialize sohm
    await sOHM.setIndex("7675210820");
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

const config = `DAI Address: "${dai.address}"
OLD OHM: "${oldOHM.address}"
OLD sOHM: "${oldSOHM.address}"
OLD Staking: "${oldStaking.address}"
OLD wsOHM: "${oldWSOHM.address}"
Timelock: "${timeLock.address}"
UniRouter: "${uniRouter}"
Old Treasury: "${oldTreasury.address}"
Authority: "${authority.address}"
Migrator: "${migrator.address}"
OHM: "${ohm.address}"
SOHM: "${sOHM.address}"
WSOHM: "${wsOHM.address}"
GOHM: "${gOHM.address}"
OlympusTreasury: "${olympusTreasury.address}"
OlympusStaking: "${staking.address}"
Distributor: "${distributor.address}"
StakingHelper: "${stakingHelper.address}"
BondCalculator: "${bondCalculator.address}"
RedeemHelper: "${redeemHelper.address}"
`
    
    fs.writeFileSync('./config/deploy.js', config)
}

main()
.then(() => process.exit())
.catch((error) => {
    console.error(error);
    process.exit(1);
});
