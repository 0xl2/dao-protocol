const { ethers } = require("hardhat");
// const locKey = require("../config/fuji-deploy.json");
const fs = require('fs');

async function main() {
    const [deployer, acc1, acc2] = await ethers.getSigners();

    const CCC = await ethers.getContractFactory("CCC")
    const ccc = await CCC.deploy()
    await ccc.deployed()
    const cccAddr = ccc.address;

    const MIM = await ethers.getContractFactory("MIM")
    const mim = await MIM.deploy(43113)
    await mim.deployed()
    const mimAddr = mim.address;

    const TestPrism = await ethers.getContractFactory("TestPrism");
    const testPrism = await TestPrism.deploy();
    await testPrism.deployed();
    const prismAddr = testPrism.address;

    const PresaleContract = await ethers.getContractFactory("PrismPresale");
    const presaleContract = await PresaleContract.deploy(
        mimAddr,
        cccAddr,
        prismAddr,
        deployer.address
    );
    await presaleContract.deployed();

    const cccMint1 = ethers.utils.parseUnits("16000000".toString(), 'gwei')
    const cccMint2 = ethers.utils.parseUnits("74000000".toString(), 'gwei')
    const cccMint3 = ethers.utils.parseUnits("75000000".toString(), 'gwei')
    await ccc.connect(deployer).mint(deployer.address, cccMint3);
    await ccc.connect(deployer).mint(acc1.address, cccMint1);
    await ccc.connect(deployer).mint(acc2.address, cccMint2);

    const mimMint = ethers.utils.parseUnits("3000".toString(), 'ether')
    await mim.connect(deployer).mint(deployer.address, mimMint);
    await mim.connect(deployer).mint(acc1.address, mimMint);
    await mim.connect(deployer).mint(acc2.address, mimMint);

    await testPrism.connect(deployer).mint(presaleContract.address, ethers.utils.parseUnits("300000".toString(), 'gwei'));

    const config = `MIM_ADDRESS: "${mimAddr}",
CCC_ADDRESS: "${cccAddr}",
PRESALE_ADDRESS: "${presaleContract.address}",
PRISM_ADDRESS: "${prismAddr}",
`
    fs.writeFileSync('./config/presale-deploy.txt', config)

const config1 = `{"MIM_ADDRESS": "${mimAddr}",
"CCC_ADDRESS": "${cccAddr}",
"PRESALE_ADDRESS": "${presaleContract.address}",
"PRISM_ADDRESS": "${prismAddr}"
}`

    fs.writeFileSync('./config/presale-deploy.json', config1)
}

main()
.then(() => process.exit())
.catch((error) => {
    console.error(error);
    process.exit(1);
});