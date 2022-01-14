const { ethers } = require("hardhat");
const { expect } = require('chai');
const presaleKey = require("../config/presale-deploy.json");

describe.only("presale test", () => {
    let deployer;
    before(async () => {
        [deployer, acc1, acc2, acc3, acc4] = await ethers.getSigners();
        // console.log(deployer.address, acc1.address, acc2.address, acc3.address, acc4.address);
    })

    it("presale view test", async() => {
        const deployerAddr = deployer.address;

        // // using dai as ccc
        // const CCC = await ethers.getContractFactory("CCC")
        // const ccc = await CCC.deploy()
        // await ccc.deployed()
        // const cccAddr = ccc.address;

        // const cccMint1 = ethers.utils.parseUnits("15000000".toString(), 'gwei')
        // const cccMint2 = ethers.utils.parseUnits("16000000".toString(), 'gwei')
        // const cccMint3 = ethers.utils.parseUnits("74000000".toString(), 'gwei')
        // const cccMint4 = ethers.utils.parseUnits("75000000".toString(), 'gwei')
        // await ccc.connect(deployer).mint(deployer.address, cccMint4);
        // await ccc.connect(deployer).mint(acc1.address, cccMint1);
        // await ccc.connect(deployer).mint(acc2.address, cccMint2);
        // await ccc.connect(deployer).mint(acc3.address, cccMint3);
        // // await ccc.connect(deployer).mint(acc4.address, cccMint1);

        // console.log(cccAddr, "cccAddr");

        // // using dai as MIM
        // const MIM = await ethers.getContractFactory("MIM")
        // const mim = await MIM.deploy(43113)
        // await mim.deployed()
        // const mimAddr = mim.address;

        // const mimMint = ethers.utils.parseUnits("1600".toString(), 'ether')
        // await mim.connect(deployer).mint(deployer.address, mimMint);
        // await mim.connect(deployer).mint(acc1.address, mimMint);
        // await mim.connect(deployer).mint(acc2.address, mimMint);
        // await mim.connect(deployer).mint(acc3.address, mimMint);
        // await mim.connect(deployer).mint(acc4.address, mimMint);

        // console.log(mimAddr, "mimAddr");

        // const Authority = await ethers.getContractFactory("OlympusAuthority")
        // const authority = await Authority.deploy(deployerAddr, deployerAddr, deployerAddr, deployerAddr)
        // await authority.deployed()
        // const authorityAddr = authority.address;

        // console.log(authorityAddr, "authorityAddr")

        // const Prism = await ethers.getContractFactory("PrismERC20");
        // const prism = await Prism.deploy(authorityAddr, deployer.address);
        // await prism.deployed()
        // const prismAddr = prism.address;

        // console.log(prismAddr, "prismAddr");

        // const Presale = await ethers.getContractFactory("PrismPresale");
        // const presale = await Presale.deploy(
        //     mimAddr,
        //     cccAddr,
        //     prismAddr,
        //     deployer.address
        // );
        // await presale.deployed();

        // console.log(presale.address, "presale");

        // await presale.connect(deployer).setWhitelist([
        //     deployer.address,
        //     acc1.address,
        //     acc2.address,
        //     acc3.address,
        //     acc4.address
        // ], true);

        // const minBuy = ethers.utils.parseUnits("500", 'ether')
        // const maxBuy = ethers.utils.parseUnits("1500", 'ether')

        // await expect(
        //     presale.connect(acc1).buy(minBuy, 0)
        // ).to.be.revertedWith("Presale is not open");

        // await presale.connect(deployer).startPresale();
        
        // console.log(await ccc.callStatic.balanceOf(acc1.address), "acc1 ccc balance");
        // console.log(await presale.callStatic.getCCCMin(0), "getCCCMin");

        // await expect(
        //     presale.connect(acc1).buy(minBuy, 0)
        // ).to.be.revertedWith("You don't have enought CCC balance")

        // await expect(
        //     presale.connect(acc2).buy(maxBuy, 1)
        // ).to.be.revertedWith("You don't have enought CCC balance")

        // await expect(
        //     presale.connect(acc3).buy(maxBuy, 1)
        // ).to.be.revertedWith("You don't have enought CCC balance")

        // await mim.connect(acc3).approve(presale.address, minBuy);
        // await presale.connect(acc3).buy(minBuy, 0);
        
        // await mim.connect(acc3).approve(presale.address, minBuy);
        // await expect(
        //     presale.connect(acc3).buy(minBuy, 0)
        // ).to.be.revertedWith("Your aPrism amount exceeds the limit")

        // const div1 = ethers.utils.parseUnits("400", 'ether')
        // await mim.connect(acc2).approve(presale.address, div1);
        // await presale.connect(acc2).buy(div1, 0);

        // const div2 = ethers.utils.parseUnits("100", 'ether')
        // await mim.connect(acc2).approve(presale.address, div2);
        // await presale.connect(acc2).buy(div2, 0);
        
        // await expect(
        //     presale.connect(acc2).buy(div2, 0)
        // ).to.be.revertedWith("Your aPrism amount exceeds the limit")

        const clientAddr = "0x0198B604c13E1ccA07A6cd31c5dC4CDE68bDdf7E";
        const clientAddr1 = "0x03C59756667F63Dd91889EB063498e4A766C18e0"
        const clientAddr2 = "0x6B29442d3BD03517208f4e1d7E516B6e633ab0B7";

        const presale = await ethers.getContractAt("PrismPresale", presaleKey.PRESALE_ADDRESS);
        const mim = await ethers.getContractAt("MIM", presaleKey.MIM_ADDRESS);
        const ccc = await ethers.getContractAt("CCC", presaleKey.CCC_ADDRESS);

        // await mim.connect(deployer).mint(clientAddr, ethers.utils.parseUnits("10000", "ether"));
        // await ccc.connect(deployer).mint(clientAddr, ethers.utils.parseUnits("200000000", "gwei"));
        
        // console.log(await presale.connect(acc1).callStatic.buy(ethers.utils.parseUnits("400", "ether"), 0));
        // await presale.connect(deployer).setWhitelist([
        //     deployer.address,
        //     acc1.address,
        //     acc2.address,
        //     clientAddr,
        //     clientAddr1,
        //     clientAddr2
        // ], true);

        // await presale.connect(deployer).startPresale();
        // await presale.connect(deployer).startClaim();

        console.log(await presale.connect(deployer).callStatic.getPercent(), "getPercent");
        console.log(await presale.connect(deployer).callStatic.getDay(), "getDay");
    })
});