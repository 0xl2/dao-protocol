const { ethers } = require("hardhat");

describe.only("Staking test", () => {
    let deployer;
    before(async () => {
        [deployer] = await ethers.getSigners();
    })

    it("get sohm", async() => {
        try {
            const rainbowAddress = "0x46f8917DDb2d8a4d86E3F44b7cd7b75c1463a7F9";
            const rainbowContract = await ethers.getContractAt("RainbowERC20", rainbowAddress);

            const lockAddress = "0x1974158f77b3a499c8A819D26Ca64261D7E89f92";
            const lockContract = await ethers.getContractAt("PrismLock", lockAddress);
            // const LockContract = await ethers.getContractFactory("PrismLock");
            // const lockContract = await LockContract.deploy("0x804718C3EA17b21a663871AB3D0fF3b9dA3CD9d8");
            // const lockAddress = lockContract.address;
            // await lockContract.deployed();
            // await lockContract.addLockUnit(86400 * 14, 115);
            // await lockContract.setPenalty(1000);
            // await lockContract.lock(deployer.address, ethers.utils.parseUnits("200", 'gwei'), 86400 * 14);
            
            console.log(await lockContract.callStatic.penalty());
            console.log(await lockContract.callStatic.userLocks(deployer.address));
            // console.log(await rainbowContract.callStatic.balanceOf(lockAddress));
            console.log(await lockContract.callStatic.chkLock(ethers.utils.parseUnits("100", 'gwei')));
        } catch(err) {
            console.log(err);
        }
    })
});
