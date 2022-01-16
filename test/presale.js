const { ethers } = require("hardhat");
const { expect } = require('chai');
const presaleKey = require("../config/presale-deploy.json");

describe.only("presale test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
        // console.log(deployer.address, acc1.address, acc2.address, acc3.address, acc4.address);
    })

    it("presale view test", async() => {
        const deployerAddr = deployer.address;

        const clientAddr = "0x0198B604c13E1ccA07A6cd31c5dC4CDE68bDdf7E";
        const clientAddr1 = "0x03C59756667F63Dd91889EB063498e4A766C18e0"
        const clientAddr2 = "0x6B29442d3BD03517208f4e1d7E516B6e633ab0B7";

        const presale = await ethers.getContractAt("PrismPresale", presaleKey.PRESALE_ADDRESS);
        // const mim = await ethers.getContractAt("MIM", presaleKey.MIM_ADDRESS);
        // const ccc = await ethers.getContractAt("CCC", presaleKey.CCC_ADDRESS);

        // await mim.connect(deployer).mint(clientAddr, ethers.utils.parseUnits("10000", "ether"));
        // await ccc.connect(deployer).mint(clientAddr, ethers.utils.parseUnits("200000000", "gwei"));
        
        // whitelisting
        await presale.connect(deployer).setWhitelist([
            deployer.address,
            clientAddr,
            clientAddr1,
            clientAddr2
        ], true);

        // set prism address
        await presale.connect(deployer).setPrism("your_prism_addr");

        // set wallet address to receive mim and unsold prism
        await presale.connect(deployer).setWallet("your_wallet_addr");
        console.log(await presale.callStatic.PrismWallet(), "PrismWallet");

        // start presale
        await presale.connect(deployer).startPresale();

        // !!!!!!!!!!!!  stop presale !!!!!!!!!!!!
        await presale.connect(deployer).stopPresale();

        // start Prism claim
        await presale.connect(deployer).startClaim();

        // withdraw AVAX from contract
        await presale.connect(deployer).withdrawFunds();

        console.log(await presale.connect(deployer).callStatic.getPercent(), "getPercent");
        console.log(await presale.connect(deployer).callStatic.getDay(), "getDay");
    })
});