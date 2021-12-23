const { ethers } = require("hardhat");

describe.only("OHM transfer test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("bond depository test", async() => {
        try {
            // const bondCalulator = await ethers.getContractAt("OlympusBondingCalculator", "0xbE8D11ed31CD496a4d0F3fd6078b49F1ab1A82DA", deployer);
            // console.log(await bondCalulator.markdown('0x796f594e502F69a188b1E524e4FB36d50924F0Eb'));

            const bondDepository = await ethers.getContractAt("OlympusBondDepository", "0x67b05A5943115d9E69CdBeA765346BF1b62fE4F4", deployer);
            const daiAddress = "0xcdB8D4084Ec7591827aC2799254a8c5b83c2182F"
            // const BondDepository = await ethers.getContractFactory("OlympusBondDepository");
            // const bondDepository = await BondDepository.deploy(
            //     "0xb5753cCCeF77E73527EB36dc29380E59048e062b", 
            //     daiAddress,
            //     "0x9f48A6C1d6C31990C05723628d1C5745b6cE7bea",
            //     "0x3D9BBb503D3456fe53a1741fC25a38663c5Ce2D4",
            //     ethers.constants.AddressZero
            // );

            // await bondDepository.deployed();
            // await bondDepository.initializeBondTerms(ethers.utils.parseUnits("1", 'gwei'), 10000, 100, 1000, 500, 100000, 100000);
            // const bondDepoAddr = bondDepository.address;
            // console.log(bondDepoAddr, "bondDepository.address");

            
            const bondDepoAddr = "0x67b05A5943115d9E69CdBeA765346BF1b62fE4F4";

            const treasury = await ethers.getContractAt("OlympusTreasury", "0x592B1bc813EDc9ABbEDA39cFc4391747f4035652")
            // await treasury.connect(deployer).queue(0, bondDepoAddr);
            // await treasury.connect(deployer).toggle(0, bondDepoAddr, bondDepoAddr);
            console.log(await treasury.isReserveToken(daiAddress), "isReserveToken");
            
            console.log(await bondDepository.callStatic.currentDebt(), "currentDebt");
            console.log(await bondDepository.callStatic.debtDecay(), "debtDecay");
            console.log(await bondDepository.callStatic.debtRatio(), "debtRatio");
            console.log(await bondDepository.callStatic.bondPrice(), "bondPrice");
            console.log(await bondDepository.callStatic.isLiquidityBond(), "isLiquidityBond");
            console.log(await bondDepository.callStatic.bondPriceInUSD(), "bondPriceInUSD");
            
            // const dai = await ethers.getContractAt("DAI", daiAddress)
            // await dai.connect(deployer).approve(bondDepoAddr, ethers.utils.parseUnits("1000000", 'ether').toString());

            // const payout = await bondDepository.payoutFor(treasuryVal);
            // console.log(payout, "payoutFor");
            // console.log(await bondDepository.bondPrice(), "bondPrice");

            // console.log(await bondDepository.callStatic.deposit(ethers.utils.parseUnits("10", 'ether'), 1900, deployer.address));
        } catch(err) {
            console.log(err);
        }
    })
});
