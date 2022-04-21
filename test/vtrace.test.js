const { ethers } = require("ethers");

const VTrace = artifacts.require("VTrace");

contract("VTrace", accounts => {
    let c;
    let address2 = accounts[2];
    let address3 = accounts[3];
    let address4 = accounts[4];
    before("deploy VTrace contract", async () => {
      c = await VTrace.deployed();
    })

    it("should get correct name", async() => {
      const name = await c.name();
      assert.equal(name, "VTrace", "name is wrong")
    })

    // test mint
    it("should mint successful", async() => {
      // admin mint a token to address2
      await c.safeMint(address2, 001) // mint to address2 a token which id is 001

      const balanceOf2 = await c.balanceOf(address2); // query balance of address2, it should equals to 1
      assert.equal(balanceOf2, 1, "balance Of address2 is wrong")
    })

    // test role
    it("should query role and grant role successful", async() => {
      minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));

      // check address3 is not a minter
      isMinter = await c.hasRole(minterRole, address3);
      assert.equal(isMinter, false, "test role failed: address3 has minter role");

      // grant minter role to address3
      await c.grantRole(minterRole, address3);
      isMinter = await c.hasRole(minterRole, address3);
      assert.equal(isMinter, true, "test role failed: address3 don't have minter role");

      // minterRole mint
      await c.safeMint(address2, 002, {from: address3})
      const balanceOf2 = await c.balanceOf(address2); // query balance of address2, it should equals to 2
      assert.equal(balanceOf2, 2, "balance Of address2 is wrong")
    })

    // // test transfer
    // it("should send coin correct", async() => {
    //   balanceOf4 = await c.balanceOf(address4);
    //   assert.equal(balanceOf4, 0, "balance of address4 is not zero");

    //   // make sure that balance of address2 enough
    //   const balanceOf2 = await c.balanceOf(address2); // query balance of address2, it should equals to 100
    //   assert.equal(balanceOf2, 100, "balance Of address2 is not enough")

    //   // function transfer(address to, uint256 amount) external returns (bool);
    //   ok = await c.transfer(address4, 10, {from: address2});
    //   assert.equal(ok, true, "transfer 10 VTC from address2 to address4 failed");
    //   balanceOf4 = await c.balanceOf(address4);
    //   assert.equal(balanceOf4, 10, "balance of address4 is wrong");
    // })

});
