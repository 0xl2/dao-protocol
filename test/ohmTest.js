const { ethers } = require("hardhat");
const locKey = require("../config/local-deploy.json");

describe.only("OHM transfer test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("bond depository test", async() => {
        try {
            // const bondCalulator = await ethers.getContractAt("BondCalculator", "0xbE8D11ed31CD496a4d0F3fd6078b49F1ab1A82DA", deployer);
            // console.log(await bondCalulator.markdown('0x796f594e502F69a188b1E524e4FB36d50924F0Eb'));

            // const bondDepository = await ethers.getContractAt("OlympusBondDepository", "0x8510c8c2B6891E04864fa196693D44E6B6ec2514", deployer);
            
            // const bondDepoAddr = locKey.DAI_BOND_DEPOSITORY;
            const bondDepository = await ethers.getContractAt("OlympusBondDepository", locKey.DAI_BOND_DEPOSITORY, deployer);
            // const daiAddress = locKey.DAI_ADDRESS
            // const BondDepository = await ethers.getContractFactory("DAIBondDepository");
            // const bondDepository = await BondDepository.deploy(
            //     "0xCaDf453B9320Ec19A79EEBc9Fe128Ab4072A12c8", 
            //     daiAddress,
            //     "0x8D80774ac36e5Ce33Bfe1F7008E3871e0964974D",
            //     "0x514c71f405b1B0EA5A083A996763C1878677A09c",
            //     ethers.constants.AddressZero
            // );

            // await bondDepository.deployed();
            // await bondDepository.initializeBondTerms(ethers.utils.parseUnits("1", 'gwei'), 10000, 100, 1000, 500, 1100000, 110000);
            // const bondDepoAddr = bondDepository.address;
            // console.log(bondDepoAddr, "bondDepository.address");
            

            const treasury = await ethers.getContractAt("OlympusTreasury", locKey.TREASURY_ADDRESS)
            // await treasury.connect(deployer).queue(0, bondDepoAddr);
            // await treasury.connect(deployer).toggle(0, bondDepoAddr, bondDepoAddr);
            // console.log(await treasury.isReserveToken(daiAddress), "isReserveToken");

            // const ohm = await ethers.getContractAt("PrismERC20", locKey.OHM_ADDRESS);
            // console.log(await ohm.callStatic.totalSupply(), "totalSupply");
            
            console.log(await bondDepository.callStatic.terms(), "terms");
            console.log(await bondDepository.callStatic.totalDebt(), "totalDebt");
            console.log(await bondDepository.callStatic.debtDecay(), "debtDecay");
            console.log(await bondDepository.callStatic.currentDebt(), "currentDebt");
            console.log(await bondDepository.callStatic.debtRatio(), "debtRatio");
            console.log(await bondDepository.callStatic.bondPrice(), "bondPrice");
            console.log(await bondDepository.callStatic.payoutFor(ethers.utils.parseUnits("200", 'gwei')), "payoutFor");
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
