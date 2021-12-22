const { ethers } = require("hardhat");

describe.only("OHM transfer test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("bond depository test", async() => {
        try {
            // const bondDepository = await ethers.getContractAt("OlympusBondDepository", "0xc7F71a591C10f38ee2E80E11C1bA878b49c68F6a", deployer);
            // const bondCalulator = await ethers.getContractAt("OlympusBondingCalculator", "0xbE8D11ed31CD496a4d0F3fd6078b49F1ab1A82DA", deployer);
            const BondDepository = await ethers.getContractFactory("OlympusBondDepository");
            const pairDaiOHM = "0x9d9074A60BBEc73A4A02201dE88Fb80ae8be9985"
            const bondDepository = await BondDepository.deploy(
                "0xF4C7A3cd6C24378154B040DD0B06280A0Acd644B", 
                pairDaiOHM,
                "0xDE8A3BBF76eE4b96DC8CF61ee6598b65abc2b358",
                "0x0d6011F81D7CA15DDe56DF6878a63Ad4A452eb49",
                ethers.constants.AddressZero
            );

            await bondDepository.deployed();
            console.log(bondDepository.address);

            const treasury = await ethers.getContractAt("OlympusTreasury", "0xDE8A3BBF76eE4b96DC8CF61ee6598b65abc2b358")
            
            await treasury.connect(deployer).queue(0, bondDepository.address);
            await treasury.connect(deployer).toggle(0, bondDepository.address, bondDepository.address);
            console.log(await treasury.isReserveToken(pairDaiOHM), "isReserveToken");
            
            await bondDepository.initializeBondTerms(ethers.utils.parseUnits("1", 'gwei'), 10000, 100, 1000, 500, 10000, 1000);
            // console.log(await bondDepository.callStatic.debtRatio());
            // console.log(await bondDepository.callStatic.bondPriceInUSD());
            
            const dai = await ethers.getContractAt("DAI", "0x9d9074A60BBEc73A4A02201dE88Fb80ae8be9985")
            await dai.connect(deployer).approve(bondDepository.address, ethers.utils.parseUnits("10", 'ether').toString());
            console.log(await bondDepository.callStatic.deposit(ethers.utils.parseUnits("10", 'ether'), 201, deployer.address));

            // const payout = await bondDepository.payoutFor(treasuryVal);
            // console.log(payout, "payoutFor");
            // console.log(await bondDepository.bondPrice(), "bondPrice");

            // console.log(await bondDepository.deposit(ethers.utils.parseUnits("10", 'ether'), 201, deployer.address), "deposit");
            // console.log(await bondCalulator.markdown('0x796f594e502F69a188b1E524e4FB36d50924F0Eb'));
        } catch(err) {
            console.log(err);
        }
    })
});
