const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("OHM transfer test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("bond depository test", async() => {
        const bondDepository = await ethers.getContractAt("OlympusBondDepository", "0xed2F2b17D972F0760A4D19f02C42D31186262d70", deployer);
        const bondCalulator = await ethers.getContractAt("OlympusBondingCalculator", "0xbE8D11ed31CD496a4d0F3fd6078b49F1ab1A82DA", deployer);
        // const BondDepository = await ethers.getContractFactory("OlympusBondDepository");
        // const bondDepository = await BondDepository.deploy(
        //     "0xF79fb0F530E8dB5A7fa8d85F0AD496bc63f39C13", 
        //     "0x796f594e502F69a188b1E524e4FB36d50924F0Eb",
        //     "0x896fB6c5b0ff3714aA6133f540a1773C1B1DA97c",
        //     "0xb20a332B659C6450411D2247a4acA35f4B76ddfE",
        //     "0xbE8D11ed31CD496a4d0F3fd6078b49F1ab1A82DA"
        // );
        // await bondDepository.deployed();
        
        // console.log(bondDepository.address);
        // await bondDepository.initializeBondTerms(100, 10000, 100, 1000, 500, 10000, 1000);
        try {
            // await bondDepository.connect(deployer)
            // .deposit(
            //     ethers.utils.parseUnits("50", 'ether'), 
            //     100, 
            //     '0x29c682349e50D6980048f5D675C73962d6b15589'
            // );

            // console.log(await bondDepository.bondPriceInUSD());
            console.log(await bondCalulator.markdown('0x796f594e502F69a188b1E524e4FB36d50924F0Eb'));
        } catch(err) {
            console.log(err);
        }
        
        // 0x02b5e3af16b1880000', _isBigNumber: true} 100 '0x29c682349e50D6980048f5D675C73962d6b15589'
    })
});
