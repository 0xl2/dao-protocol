const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    const [deployer] = await ethers.getSigners();

    const mimAddr = "MIM_ADDR";
    const cccAddr = "CCC_ADDR";

    const PresaleContract = await ethers.getContractFactory("PrismPresale");
    const presaleContract = await PresaleContract.deploy(
        mimAddr,
        cccAddr
    );
    await presaleContract.deployed();

    const config = `MIM_ADDRESS: "${mimAddr}",
CCC_ADDRESS: "${cccAddr}",
PRESALE_ADDRESS: "${presaleContract.address}",
`
    fs.writeFileSync('./config/presale-deploy.txt', config)

const config1 = `{"MIM_ADDRESS": "${mimAddr}",
"CCC_ADDRESS": "${cccAddr}",
"PRESALE_ADDRESS": "${presaleContract.address}",
}`

    fs.writeFileSync('./config/presale-deploy.json', config1)
}

main()
.then(() => process.exit())
.catch((error) => {
    console.error(error);
    process.exit(1);
});