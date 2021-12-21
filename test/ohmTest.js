const { ethers } = require("hardhat");

describe.only("OHM transfer test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("bond depository test", async() => {
        // const bondDepository = await ethers.getContractAt("OlympusBondDepository", "0xed2F2b17D972F0760A4D19f02C42D31186262d70", deployer);
        // const bondCalulator = await ethers.getContractAt("OlympusBondingCalculator", "0xbE8D11ed31CD496a4d0F3fd6078b49F1ab1A82DA", deployer);
        const BondDepository = await ethers.getContractFactory("OlympusBondDepository");
        const bondDepository = await BondDepository.deploy(
            "0x1014A4121494f7e460Ea4478a81d573e21790783", 
            "0x3a106B6362bea194F42a25686a87D4AD04bA8AE7",
            "0xF32bc9945B58d1F097118A6011b923475F2CCCB2",
            "0xEd64a726c5Efddf19F2AA6b4F9F1360eAEf83271",
            "0xb66113155feD3d960592c663378752fED358bCe4"
        );
        await bondDepository.deployed();
        
        console.log(bondDepository.address);
        // await bondDepository.initializeBondTerms(100, 10000, 100, 1000, 500, 10000, 1000);
        try {
            // await bondDepository.connect(deployer)
            // .deposit(
            //     ethers.utils.parseUnits("50", 'ether'), 
            //     100, 
            //     '0x29c682349e50D6980048f5D675C73962d6b15589'
            // );

            console.log(await bondDepository.debtRatio(), "here");
            // console.log(await bondCalulator.markdown('0x796f594e502F69a188b1E524e4FB36d50924F0Eb'));
        } catch(err) {
            console.log(err);
        }
    })
});
