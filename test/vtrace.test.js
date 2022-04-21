const { ethers } = require("ethers");

const VTrace = artifacts.require("VTrace");

contract("VTrace", accounts => {
    let c;
    before("deploy VTrace contract", async () => {
      c = await VTrace.deployed();
    })

    it("should get correct name", async() => {
      const name = await c.name();
      assert.equal(name, "VTrace", "name is wrong")
    })

    // test mint
    it("should mint successful", async() => {
      // admin mint a token to accounts[2]
      await c.safeMint(accounts[2], 001) // mint to accounts[2] a token which id is 001

      const balanceOf2 = await c.balanceOf(accounts[2]); // query balance of accounts[2], it should equals to 1
      assert.equal(balanceOf2, 1, "balance Of accounts[2] is wrong")

      const owner = await c.ownerOf(001)
      assert.equal(accounts[2], owner, "owner of token 001 is wrong")
    })

    // test role
    it("should query role and grant role successful", async() => {
      minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));

      // check accounts[3] is not a minter
      isMinter = await c.hasRole(minterRole, accounts[3]);
      assert.equal(isMinter, false, "test role failed: accounts[3] has minter role");

      // grant minter role to accounts[3]
      await c.grantRole(minterRole, accounts[3]);
      isMinter = await c.hasRole(minterRole, accounts[3]);
      assert.equal(isMinter, true, "test role failed: accounts[3] don't have minter role");

      // minterRole mint
      await c.safeMint(accounts[2], 002, {from: accounts[3]})
      const balanceOf2 = await c.balanceOf(accounts[2]); // query balance of accounts[2], it should equals to 2
      assert.equal(balanceOf2, 2, "balance Of accounts[2] is wrong")
    })

    // test transfer
    it("should send token correct", async() => {
      balanceOf4 = await c.balanceOf(accounts[4]);
      assert.equal(balanceOf4, 0, "balance of accounts[4] is not zero");

      // make sure that balance of accounts[2] enough
      const balanceOf2 = await c.balanceOf(accounts[2]); // query balance of accounts[2], it should equals to 100
      assert.equal(balanceOf2, 2, "balance Of accounts[2] is not enough")

      // 1. safe transfer token from owner to a root user
      await c.safeTransferFrom(accounts[2], accounts[0], 001, {from: accounts[2]});
      balanceOf0 = await c.balanceOf(accounts[0]);
      assert.equal(balanceOf0, 1, "balance of accounts[0] is wrong");
      owner = await c.ownerOf(001)
      assert.equal(accounts[0], owner, "owner of token 001 is wrong")
      // 2. safe transfer token from root user to another user
      await c.safeTransferFrom(accounts[0], accounts[4], 001, {from: accounts[0]})
      balanceOf4 = await c.balanceOf(accounts[4]);
      assert.equal(balanceOf4, 1, "balance of accounts[4] is wrong");
      owner = await c.ownerOf(001)
      assert.equal(accounts[4], owner, "owner of token 001 is wrong")
    })

});
