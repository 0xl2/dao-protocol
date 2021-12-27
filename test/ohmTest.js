const { ethers } = require("hardhat");

describe("OHM transfer test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("bond depository test", async() => {
        try {
            // const bondCalulator = await ethers.getContractAt("OlympusBondingCalculator", "0xbE8D11ed31CD496a4d0F3fd6078b49F1ab1A82DA", deployer);
            // console.log(await bondCalulator.markdown('0x796f594e502F69a188b1E524e4FB36d50924F0Eb'));

            // const bondDepository = await ethers.getContractAt("OlympusBondDepository", "0x27F4f50680556833EbecBA6ead615AbA6C813e3B", deployer);
            const daiAddress = "0x24746149516951E4e2175a4C18F1Bfa36492a940"
            const BondDepository = await ethers.getContractFactory("OlympusBondDepository");
            const bondDepository = await BondDepository.deploy(
                "0x2be17B6e931Ea15EfECb234bC772444d66558856", 
                daiAddress,
                "0x672BF8E109f94586089D176e7018105f09AA6546",
                "0x034A7c68740445c68a134efDfb23f1A52225199a",
                ethers.constants.AddressZero
            );

            await bondDepository.deployed();
            await bondDepository.initializeBondTerms(ethers.utils.parseUnits("1", 'gwei'), 10000, 100, 1000, 500, 1100000, 110000);
            const bondDepoAddr = bondDepository.address;
            console.log(bondDepoAddr, "bondDepository.address");

            
            // const bondDepoAddr = "0x67b05A5943115d9E69CdBeA765346BF1b62fE4F4";

            const treasury = await ethers.getContractAt("OlympusTreasury", "0x672BF8E109f94586089D176e7018105f09AA6546")
            // await treasury.connect(deployer).queue(0, bondDepoAddr);
            // await treasury.connect(deployer).toggle(0, bondDepoAddr, bondDepoAddr);
            console.log(await treasury.isReserveToken(daiAddress), "isReserveToken");

            const ohm = await ethers.getContractAt("PrismERC20Token", "0x2be17B6e931Ea15EfECb234bC772444d66558856");
            console.log(await ohm.callStatic.totalSupply(), "totalSupply");
            
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
