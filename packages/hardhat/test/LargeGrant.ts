import { describe, it } from "mocha";
import { LargeGrant, TestToken } from "../typechain-types";
import { deployments, ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";

describe("LargeGrant", async () => {
  let largeGrant: LargeGrant;
  let testToken: TestToken;
  let deployer: SignerWithAddress;
  let owner2: SignerWithAddress;
  let builder: SignerWithAddress;
  let nonOwner: SignerWithAddress;
  let accounts: SignerWithAddress[];
  const initialFund = ethers.parseEther("1000");

  beforeEach(async () => {
    await deployments.fixture(["Stream"]);
    accounts = await ethers.getSigners();
    [deployer, owner2, builder, nonOwner] = accounts;

    // Deploy TestToken
    const TestTokenFactory = await ethers.getContractFactory("TestToken");
    testToken = await TestTokenFactory.deploy();
    await testToken.waitForDeployment();
    const tokenAddress = await testToken.getAddress();

    // Deploy with multiple initial owners
    const LargeGrantFactory = await ethers.getContractFactory("LargeGrant");
    largeGrant = await LargeGrantFactory.deploy(tokenAddress, [deployer.address, owner2.address]);
    await largeGrant.waitForDeployment();

    const contractAddress = await largeGrant.getAddress();
    await testToken.mint(contractAddress, initialFund);

    await largeGrant.addGrant(builder.address, 1, [1, 10, 100]);
  });

  it("Should add grant correctly", async () => {
    const builderAddress = await largeGrant.grants(1);
    expect(builderAddress).to.equal(builder.address);

    const grantData = await largeGrant.grantData(1);
    expect(grantData.builder).to.equal(builder.address);
    expect(grantData.milestones.length).to.equal(3);
    expect(grantData.milestones[0].stageNumber).to.equal(1);
    expect(grantData.milestones[0].number).to.equal(1);
    expect(grantData.milestones[0].amount).to.equal(1);
    expect(grantData.milestones[0].completed).to.equal(false);
    expect(grantData.milestones[1].stageNumber).to.equal(1);
    expect(grantData.milestones[1].number).to.equal(2);
    expect(grantData.milestones[1].amount).to.equal(10);
    expect(grantData.milestones[1].completed).to.equal(false);
    expect(grantData.milestones[2].stageNumber).to.equal(1);
    expect(grantData.milestones[2].number).to.equal(3);
    expect(grantData.milestones[2].amount).to.equal(100);
    expect(grantData.milestones[2].completed).to.equal(false);
  });

  it("Should allow to add a new grant correctly", async () => {
    await largeGrant.addGrant(builder.address, 2, [100, 1000]);

    const builderAddress = await largeGrant.grants(2);
    expect(builderAddress).to.equal(builder.address);
  });

  it("Should not allow to add a new grant with the same number", async () => {
    await expect(largeGrant.addGrant(builder.address, 1, [100, 1000])).to.be.reverted;
  });

  it("Should not allow to add a new grant with the builder zero address", async () => {
    await expect(largeGrant.addGrant(ethers.ZeroAddress, 2, [100, 1000])).to.be.reverted;
  });

  it("Should not allow to add a new grant with a milestone with a zero amount", async () => {
    await expect(largeGrant.addGrant(builder.address, 2, [100, 0])).to.be.reverted;
  });

  it("Should not allow to add a new grant with no milestones", async () => {
    await expect(largeGrant.addGrant(builder.address, 2, [])).to.be.reverted;
  });

  it("Should allow to add a new grant stage correctly", async () => {
    await largeGrant.addGrantStage(1, [200, 2000]);

    const grantData = await largeGrant.grantData(1);
    expect(grantData.builder).to.equal(builder.address);
    expect(grantData.milestones.length).to.equal(5);
    expect(grantData.milestones[0].stageNumber).to.equal(1);
    expect(grantData.milestones[0].number).to.equal(1);
    expect(grantData.milestones[0].amount).to.equal(1);
    expect(grantData.milestones[0].completed).to.equal(false);
    expect(grantData.milestones[1].stageNumber).to.equal(1);
    expect(grantData.milestones[1].number).to.equal(2);
    expect(grantData.milestones[1].amount).to.equal(10);
    expect(grantData.milestones[1].completed).to.equal(false);
    expect(grantData.milestones[2].stageNumber).to.equal(1);
    expect(grantData.milestones[2].number).to.equal(3);
    expect(grantData.milestones[2].amount).to.equal(100);
    expect(grantData.milestones[2].completed).to.equal(false);
    expect(grantData.milestones[3].stageNumber).to.equal(2);
    expect(grantData.milestones[3].number).to.equal(1);
    expect(grantData.milestones[3].amount).to.equal(200);
    expect(grantData.milestones[3].completed).to.equal(false);
    expect(grantData.milestones[4].stageNumber).to.equal(2);
    expect(grantData.milestones[4].number).to.equal(2);
    expect(grantData.milestones[4].amount).to.equal(2000);
    expect(grantData.milestones[4].completed).to.equal(false);
  });

  it("Should allow to approve a milestone correctly", async () => {
    await largeGrant.approveMilestone(1, 1, 1);

    const grantDataAfterApproval = await largeGrant.grantData(1);
    expect(grantDataAfterApproval.milestones[0].completed).to.equal(false);
    expect(grantDataAfterApproval.milestones[0].approvedBy).to.equal(deployer.address);
    expect(grantDataAfterApproval.milestones[0].completedBy).to.equal(ethers.ZeroAddress);
  });

  it("Should allow to complete a milestone correctly", async () => {
    const initialBalance = await testToken.balanceOf(builder.address);

    await largeGrant.approveMilestone(1, 1, 1);

    const grantDataAfterApproval = await largeGrant.grantData(1);
    expect(grantDataAfterApproval.milestones[0].completed).to.equal(false);
    expect(grantDataAfterApproval.milestones[0].approvedBy).to.equal(deployer.address);
    expect(grantDataAfterApproval.milestones[0].completedBy).to.equal(ethers.ZeroAddress);

    const newBalanceAfterApproval = await testToken.balanceOf(builder.address);
    expect(newBalanceAfterApproval).to.equal(initialBalance);

    await largeGrant.connect(owner2).completeMilestone(1, 1, 1, "Description", "Proof");

    const grantData = await largeGrant.grantData(1);
    expect(grantData.milestones[0].completed).to.equal(true);
    expect(grantData.milestones[0].approvedBy).to.equal(deployer.address);
    expect(grantData.milestones[0].completedBy).to.equal(owner2.address);

    const newBalance = await testToken.balanceOf(builder.address);
    expect(newBalance).to.equal(initialBalance + 1n);
  });

  it("Should not allow to complete a milestone if the sender is the same as the approver", async () => {
    await largeGrant.approveMilestone(1, 1, 1);

    await expect(largeGrant.completeMilestone(1, 1, 1, "Description", "Proof")).to.be.reverted;
  });

  it("Should not allow to complete a milestone if it's not approved yet", async () => {
    await expect(largeGrant.completeMilestone(1, 1, 1, "Description", "Proof")).to.be.reverted;
  });

  it("Should not allow to complete a milestone with wrong grant number", async () => {
    await expect(largeGrant.completeMilestone(2, 1, 1, "Description", "Proof")).to.be.reverted;
  });

  it("Should not allow to complete a milestone with wrong stage number", async () => {
    await expect(largeGrant.completeMilestone(1, 2, 1, "Description", "Proof")).to.be.reverted;
  });

  it("Should not allow to complete a milestone with zero as stage number", async () => {
    await expect(largeGrant.completeMilestone(1, 0, 1, "Description", "Proof")).to.be.reverted;
  });

  it("Should not allow to complete a milestone with wrong milestone number", async () => {
    await expect(largeGrant.completeMilestone(1, 1, 4, "Description", "Proof")).to.be.reverted;
  });

  it("Should not allow to complete a milestone twice", async () => {
    await largeGrant.approveMilestone(1, 1, 1);

    await largeGrant.connect(owner2).completeMilestone(1, 1, 1, "Description", "Proof");

    await expect(largeGrant.connect(owner2).completeMilestone(1, 1, 1, "Description", "Proof")).to.be.reverted;
  });

  // Admin actions
  it("Should allow the admin to add a new owner", async function () {
    const newOwner = accounts[5];
    await expect(largeGrant.connect(deployer).addOwner(newOwner.address))
      .to.emit(largeGrant, "RoleGranted")
      .withArgs(ethers.keccak256(ethers.toUtf8Bytes("OWNER_ROLE")), newOwner.address, deployer.address);

    // Check if the new owner can perform owner actions
    await expect(largeGrant.connect(newOwner).addGrant(accounts[6].address, 2, [1, 10])).to.not.be.reverted;
  });

  it("Should allow the admin to remove an owner", async function () {
    await expect(largeGrant.connect(deployer).removeOwner(owner2.address))
      .to.emit(largeGrant, "RoleRevoked")
      .withArgs(ethers.keccak256(ethers.toUtf8Bytes("OWNER_ROLE")), owner2.address, deployer.address);

    // Check if the removed owner can no longer perform owner actions
    await expect(largeGrant.connect(owner2).addGrant(accounts[5].address, 2, [1, 10])).to.be.reverted;
  });

  it("Should allow the admin to transfer admin", async function () {
    await expect(largeGrant.connect(deployer).transferAdmin(owner2.address)).to.not.be.reverted;

    // Check if the old admin can no longer perform admin actions
    await expect(largeGrant.connect(deployer).addOwner(accounts[5].address)).to.be.reverted;

    // Check if the new admin can perform admin actions
    await expect(largeGrant.connect(owner2).addOwner(accounts[5].address)).to.not.be.reverted;
  });

  it("Should not allow not admin to transfer admin", async function () {
    await expect(largeGrant.connect(owner2).transferAdmin(accounts[5].address)).to.be.reverted;
  });

  it("Should allow the admin to pause and unpause the contract", async function () {
    await expect(largeGrant.connect(deployer).pause()).to.not.be.reverted;

    // Check if the contract is paused trying to approve a milestone
    await expect(largeGrant.connect(deployer).approveMilestone(1, 1, 1)).to.be.reverted;

    await expect(largeGrant.connect(deployer).unpause()).to.not.be.reverted;

    await expect(largeGrant.connect(deployer).approveMilestone(1, 1, 1)).to.not.be.reverted;

    await expect(largeGrant.connect(deployer).pause()).to.not.be.reverted;

    // Check if the contract is paused trying to complete a milestone
    await expect(largeGrant.connect(owner2).completeMilestone(1, 1, 1, "Description", "Proof")).to.be.reverted;

    await expect(largeGrant.connect(deployer).unpause()).to.not.be.reverted;

    await expect(largeGrant.connect(owner2).completeMilestone(1, 1, 1, "Description", "Proof")).to.not.be.reverted;
  });

  it("Should not allow not admin to pause the contract", async function () {
    await expect(largeGrant.connect(owner2).pause()).to.be.reverted;
  });

  it("Should not allow not admin to unpause the contract", async function () {
    await expect(largeGrant.connect(deployer).pause()).to.not.be.reverted;

    await expect(largeGrant.connect(owner2).unpause()).to.be.reverted;
  });

  // Owner actions
  it("Should not allow an owner to add or remove owners", async function () {
    await expect(largeGrant.connect(owner2).addOwner(accounts[5].address)).to.be.reverted;

    await expect(largeGrant.connect(owner2).removeOwner(deployer.address)).to.be.reverted;
  });

  it("Should not allow non-owners to add or remove owners", async function () {
    await expect(largeGrant.connect(builder).addOwner(accounts[5].address)).to.be.reverted;

    await expect(largeGrant.connect(builder).removeOwner(owner2.address)).to.be.reverted;
  });

  it("Should not allow non-owners to create a grant", async function () {
    await expect(largeGrant.connect(nonOwner).addGrant(accounts[5].address, 2, [1, 10])).to.be.reverted;
  });

  it("Should not allow non-owners to create a stage", async function () {
    await expect(largeGrant.connect(nonOwner).addGrantStage(1, [1, 10])).to.be.reverted;
  });

  it("Should not allow non-owners to approve a milestone", async function () {
    await expect(largeGrant.connect(nonOwner).approveMilestone(1, 1, 1)).to.be.reverted;
  });

  it("Should not allow non-owners to complete a milestone", async function () {
    await expect(largeGrant.connect(nonOwner).completeMilestone(1, 1, 1, "Description", "Proof")).to.be.reverted;
  });
});
