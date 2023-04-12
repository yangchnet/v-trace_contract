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
      // digest: 001 => [{transId1:digest}]
      await c.safeMint(accounts[2], 001, "transId1", "digest1") // mint to accounts[2] a token which id is 001

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
      // digest: 002 => [{"transId2": "digest"}]
      await c.safeMint(accounts[2], 002, "transId2", "digest2", {from: accounts[3]})
      const balanceOf2 = await c.balanceOf(accounts[2]); // query balance of accounts[2], it should equals to 2
      assert.equal(balanceOf2, 2, "balance Of accounts[2] is wrong")
    })

    // test transfer
    it("should send token correct", async() => {
      balanceOf4 = await c.balanceOf(accounts[4]);
      assert.equal(balanceOf4, 0, "balance of accounts[4] is not zero");

      // make sure that balance of accounts[2] enough
      const balanceOf2 = await c.balanceOf(accounts[2]); // query balance of accounts[2], it should equals to 2
      assert.equal(balanceOf2, 2, "balance Of accounts[2] is not enough")

      // 1. safe transfer token from owner to a root user
      // digest: 001 => [{"transId1": "digest"}, {"transId3": "digest"}]
      await c.safeTransferFrom(accounts[2], accounts[0], 001, "transId3", "digest3", {from: accounts[2]});
      balanceOf0 = await c.balanceOf(accounts[0]);
      assert.equal(balanceOf0, 1, "balance of accounts[0] is wrong");
      owner = await c.ownerOf(001)
      assert.equal(accounts[0], owner, "owner of token 001 is wrong")

      // 2. safe transfer token from root user to another user
      // digest: 001 => [{"transId1": "digest"}, {"transId3": "digest"}, {"transId4": "digest"}]
      await c.safeTransferFrom(accounts[0], accounts[4], 001, "transId4", "digest4", {from: accounts[0]})
      balanceOf4 = await c.balanceOf(accounts[4]);
      assert.equal(balanceOf4, 1, "balance of accounts[4] is wrong");
      owner = await c.ownerOf(001)
      assert.equal(accounts[4], owner, "owner of token 001 is wrong")
    })

    // test approve
    it("should transfer after approve", async() => {
      balanceOf5 = await c.balanceOf(accounts[5]);
      assert.equal(balanceOf5, 0, "balance of accounts[5] is not zero");

      // 1. make sure that balance of accounts[2] enough
      const balanceOf2 = await c.balanceOf(accounts[2]); // query balance of accounts[2], it should equals to 1
      assert.equal(balanceOf2, 1, "balance Of accounts[2] is not enough")

      // 2. accounts[2] approve to accounts[4]
      await c.approve(accounts[5], 002, {from: accounts[2]})

      // 3. check approved
      approvedAddress = await c.getApproved(002)
      assert.equal(accounts[5], approvedAddress, "accounts[5] is not approved")

      // 4. transfer and check balance
      // digest: 002 => [{"transId2": "digest"}, {"transId5": "digest"}]
      await c.safeTransferFrom(accounts[2], accounts[5], 002, "transId5", "digest5", {from: accounts[5]})
      balanceOf5 = await c.balanceOf(accounts[5]);
      assert.equal(balanceOf5, 1, "balance of accounts[5] is wrong");
      owner = await c.ownerOf(002)
      assert.equal(accounts[5], owner, "owner of token 002 is wrong")
    })

    // test process
    it("should add process info", async() => {
      // 1. check accounts[5] balance
      balanceOf5 = await c.balanceOf(accounts[5]);
      assert.equal(balanceOf5, 1, "balance of accounts[5] is wrong");
      owner = await c.ownerOf(002)
      assert.equal(accounts[5], owner, "owner of token 002 is wrong")

      // 2. add token 002 process infos
      // digest: 002 => [{"transId2": "digest"}, {"transId5": "digest"}, {"transId6": "digest"}]
      await c.process(002, "transId6", "digest6", {from: accounts[5]})
      // digest: 002 => [{"transId2": "digest"}, {"transId5": "digest"}, {"transId6": "digest"}, {"transId7": "digest"}]
      await c.process(002, "transId7", "digest7", {from: accounts[5]})
    })

    // test digest
    it("should record transId and digest", async() =>{
      // 1. get token 001 transIds
      transIds001 = await c.getTransIds(001);
      assert.equal(transIds001.join(", "), "transId1, transId3, transId4", "token 001's transId record mistake")
      transIds002 = await c.getTransIds(002);
      assert.equal(transIds002.join(", "), "transId2, transId5, transId6, transId7", "token 002's transId record mistake")

      // 2. checkout digest
      digest1 = await c.transDigest(transIds001[0]);
      assert.equal(digest1, "digest1", "transId1's digest is mistake");

      digest3 = await c.transDigest(transIds001[1]);
      assert.equal(digest3, "digest3", "transId3's digest is mistake");

      digest7 = await c.transDigest(transIds002[3]);
      assert.equal(digest7, "digest7", "transId7's digest is mistake");
    })

    // test batch Operation
    it("should batch operation successful", async() => {
      // 1. batch mint 003, 004, 005 to account[6]
      await c.batchMint(accounts[6], [003, 004, 005], ["transId8", "transId9", "transId10"], "digest8")
      balanceOf6 = await c.balanceOf(accounts[6]);
      assert.equal(balanceOf6, 3, "balance of accounts[6] is wrong, batch mint failed");

      // 2. batch transform 003, 004 from account[6] to account[7]
      await c.batchTransform(accounts[6], accounts[7], [003, 004], ["transId11", "transId12"], "digest9", {from: accounts[6]})
      balanceOf6 = await c.balanceOf(accounts[6]);
      assert.equal(balanceOf6, 1, "balance of accounts[6] is wrong, batch transform failed");
      balanceOf7 = await c.balanceOf(accounts[7]);
      assert.equal(balanceOf7, 2, "balance of accounts[7] is wrong, batch transform failed");

      // 3. batch process 003, 004
      await c.batchProcess([003, 004], ["transId13", "transId14"], "digest10", {from: accounts[7]})
      transIds003 = await c.getTransIds(003);
      assert.equal(transIds003.join(", "), "transId8, transId11, transId13", "token 003's transId record mistake")
      transIds004 = await c.getTransIds(004);
      assert.equal(transIds004.join(", "), "transId9, transId12, transId14", "token 004's transId record mistake")
    })
});
