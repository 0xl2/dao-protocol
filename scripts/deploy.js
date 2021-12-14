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

    const OldOHM = await ethers.getContractFactory("OldOlympusERC20Token")
    const oldOHM = await OldOHM.deploy()

    const OldSOHM = await ethers.getContractFactory("OldSOlympus")
    const oldSOHM = await OldSOHM.deploy()

    const OldStaking = await ethers.getContractFactory("OldOlympusStaking")
    const oldStaking = await OldStaking.deploy(
        oldOHM.address,
        oldSOHM.address,
        epochLength,
        firstEpochNumber,
        firstBlockNumber
    )

    const OldWSOHM = await ethers.getContractFactory("OldWOHM")
    const oldWSOHM = await OldWSOHM.deploy(oldSOHM.address)

    const TimeLock = await ethers.getContractFactory("Timelock")
    const timeLock = await TimeLock.deploy(deployer.address, 14 * 24 * 60 * 60)

    const uniRouter = "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106"

    const OldTreasury = await ethers.getContractFactory("OldOlympusTreasury")
    const oldTreasury = await OldTreasury.deploy(oldOHM.address, dai.address, 0)
    
    const Authority = await ethers.getContractFactory("OlympusAuthority")
    const authority = await Authority.deploy(deployer.address, deployer.address, deployer.address, deployer.address)

    const Migrator = await ethers.getContractFactory("OlympusTokenMigrator");
    const migrator = await Migrator.deploy(
        oldOHM.address,
        oldSOHM.address,
        oldTreasury.address,
        oldStaking.address,
        oldWSOHM.address,
        timeLock.address,
        uniRouter,
        "0",
        authority.address
    );

    const OHM = await ethers.getContractFactory("OlympusERC20Token");
    const ohm = await OHM.deploy(authority.address);

    const SOHM = await ethers.getContractFactory("sOlympus");
    const sOHM = await SOHM.deploy();

    const WSOHM = await ethers.getContractFactory("wOHM");
    const wsOHM = await WSOHM.deploy(sOHM.address)

    const GOHM = await ethers.getContractFactory("gOHM");
    const gOHM = await GOHM.deploy(migrator.address, sOHM.address);

    await migrator.setgOHM(gOHM.address);

    const OlympusTreasury = await ethers.getContractFactory("OlympusTreasury");
    const olympusTreasury = await OlympusTreasury.deploy(ohm.address, dai.address, dai.address, "0");

    await authority.pushVault(olympusTreasury.address, true);

    const OlympusStaking = await ethers.getContractFactory("OlympusStaking");
    const staking = await OlympusStaking.deploy(
        ohm.address,
        sOHM.address,
        "2200",
        firstEpochNumber,
        firstBlockNumber
    );

    const Distributor = await ethers.getContractFactory("Distributor");
    const distributor = await Distributor.deploy(
        olympusTreasury.address,
        ohm.address,
        staking.address,
        authority.address
    );

    // Initialize sohm
    await sOHM.setIndex("7675210820");
    // await sOHM.setgOHM(gOHM.address);
    await sOHM.initialize(staking.address);

    const StakingHelper = await ethers.getContractFactory("StakingHelper")
    const stakingHelper = await StakingHelper.deploy(staking.address, ohm.address)

    const BondCalculator = await ethers.getContractFactory("OlympusBondingCalculator")
    const bondCalculator = await BondCalculator.deploy(ohm.address)

    const RedeemHelper = await ethers.getContractFactory("RedeemHelper")
    const redeemHelper = await RedeemHelper.deploy()

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
