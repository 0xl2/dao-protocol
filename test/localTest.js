// it("OHM transfer", async() => {
    //     const ohmContract = await ethers.getContractAt("OlympusERC20Token", "0x0C3CfaE41eA239e86AedE52CCAf0Bf900a24E07f", deployer);
    //     const stakingContract = await ethers.getContractAt("OlympusStaking", "0xaD3D64f29f591835cB223c12af3716ae7Df6e3A9", deployer);
        
    //     try {
    //         // const stakeTx = await staingHelper.connect(deployer).stake(ethers.utils.parseUnits("1", "gwei"));
    //         // console.log(stakeTx, "success");
    //         const StakingHelper = await ethers.getContractFactory("StakingHelper")
    //         const stakingHelper = await StakingHelper.deploy("0xaD3D64f29f591835cB223c12af3716ae7Df6e3A9", "0x0C3CfaE41eA239e86AedE52CCAf0Bf900a24E07f")
    //         await stakingHelper.deployed()

    //         await ohmContract.connect(deployer).approve(stakingHelper.address, ethers.utils.parseUnits("1000000000", "gwei").toString());
    //         await stakingContract.connect(deployer).setWarmup(2);

    //         console.log(stakingHelper.address);


    //         const stakeTx = await stakingHelper.connect(deployer).stake(ethers.utils.parseUnits("1", "gwei"));
    //         console.log(stakeTx, "success");
    //     } catch(e) {
    //         console.log(e)
    //     }
    // })