import { describe, it } from "mocha";
import { Stream } from "../typechain-types";
import { deployments, ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";

describe("Stream", async () => {
  let stream: Stream;
  let deployer: SignerWithAddress;
  let builder: SignerWithAddress;
  let accounts: SignerWithAddress[];
  const initialFund = ethers.parseEther("1000");
  const cap = ethers.parseEther("100");
  let grantId: bigint;

  beforeEach(async () => {
    await deployments.fixture(["Stream"]);
    accounts = await ethers.getSigners();
    [deployer, builder] = accounts;
    stream = await ethers.getContract("Stream", deployer);
    const contractAddress = await stream.getAddress();
    await deployer.sendTransaction({
      to: contractAddress,
      value: initialFund,
    });

    grantId = await stream.nextGrantId();

    await stream.addGrantStream(builder.address, cap, 1);
  });

  it("Should add grant stream correctly", async () => {
    const grantInfo = await stream.grantStreams(grantId);
    expect(grantInfo.cap).to.equal(cap);
    expect(grantInfo.amountLeft).to.equal(cap);
    expect(grantInfo.builder).to.equal(builder.address);

    const newNextGrantId = await stream.nextGrantId();
    expect(newNextGrantId).to.equal(grantId + 1n);
  });

  it("Should allow withdrawal after 15 days", async () => {
    await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    const unlockedAmount = await stream.unlockedGrantAmount(grantId);
    expect(unlockedAmount).to.be.closeTo(ethers.parseEther("50"), ethers.parseEther("0.1"));

    const initialBalance = await ethers.provider.getBalance(builder.address);
    await stream.connect(builder).streamWithdraw(grantId, unlockedAmount, "First withdrawal");
    const finalBalance = await ethers.provider.getBalance(builder.address);

    expect(finalBalance).to.be.gt(initialBalance);

    const grantInfo = await stream.grantStreams(grantId);
    expect(grantInfo.amountLeft).to.be.closeTo(ethers.parseEther("50"), ethers.parseEther("0.1"));
  });

  it("Shouldn't refill the stream", async () => {
    // Set time to 22.5 days
    await ethers.provider.send("evm_increaseTime", [22.5 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    // Withdraw 75 ETH
    const firstWithdrawalAmount = ethers.parseEther("75");
    await stream.connect(builder).streamWithdraw(grantId, firstWithdrawalAmount, "First partial withdrawal");

    // Check grant info after first withdrawal
    let grantInfo = await stream.grantStreams(grantId);
    expect(grantInfo.amountLeft).to.be.eq(ethers.parseEther("25"));

    // Increase time by 15 more days
    await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    // Try to withdraw 50 ETH (should fail)
    const secondWithdrawalAmount = ethers.parseEther("50");
    await expect(
      stream.connect(builder).streamWithdraw(grantId, secondWithdrawalAmount, "Second withdrawal attempt"),
    ).to.be.revertedWithCustomError(stream, "InsufficientStreamFunds");

    // Check the actual unlocked amount, since stream won't refill it should be max amount left
    const unlockedAmount = await stream.unlockedGrantAmount(grantId);
    expect(unlockedAmount).to.be.eq(grantInfo.amountLeft);

    // Withdraw the actual unlocked amount
    await stream.connect(builder).streamWithdraw(grantId, unlockedAmount, "Final withdrawal");

    // Check final grant info
    grantInfo = await stream.grantStreams(grantId);
    expect(grantInfo.amountLeft).to.be.closeTo(ethers.parseEther("0"), ethers.parseEther("0.01"));
  });

  it("Should allow multiple withdrawals", async () => {
    // First withdrawal after 15 days
    await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    let unlockedAmount = await stream.unlockedGrantAmount(grantId);
    await stream.connect(builder).streamWithdraw(grantId, unlockedAmount, "First withdrawal");

    // Second withdrawal after 10 more days
    await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    unlockedAmount = await stream.unlockedGrantAmount(grantId);
    expect(unlockedAmount).to.be.closeTo(ethers.parseEther("33.33"), ethers.parseEther("0.1"));

    const initialBalance = await ethers.provider.getBalance(builder.address);
    await stream.connect(builder).streamWithdraw(grantId, unlockedAmount, "Second withdrawal");
    const finalBalance = await ethers.provider.getBalance(builder.address);

    expect(finalBalance).to.be.gt(initialBalance);

    const grantInfo = await stream.grantStreams(grantId);
    expect(grantInfo.amountLeft).to.be.closeTo(ethers.parseEther("16.67"), ethers.parseEther("0.1"));
  });

  it("Should not allow update when significant amount is left", async () => {
    await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    const newCap = ethers.parseEther("200");
    await expect(stream.moveGrantToNextStage(grantId, newCap)).to.be.revertedWithCustomError(
      stream,
      "PreviousAmountNotFullyWithdrawn",
    );
  });

  it("Should allow update when only dust is left", async () => {
    // Withdraw all but dust
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    const unlockedAmount = await stream.unlockedGrantAmount(grantId);
    const dustAmount = await stream.DUST_THRESHOLD();
    const amountMinusDust = unlockedAmount - dustAmount;
    await stream.connect(builder).streamWithdraw(grantId, amountMinusDust, "Withdrawal leaving dust");

    // Update stream
    const newCap = ethers.parseEther("200");
    await stream.moveGrantToNextStage(grantId, newCap);

    const grantInfo = await stream.grantStreams(grantId);
    expect(grantInfo.cap).to.equal(newCap);
    expect(grantInfo.amountLeft).to.equal(newCap);
  });

  it("Should allow withdrawal after update", async () => {
    // First, withdraw all but dust
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    const unlockedAmount = await stream.unlockedGrantAmount(grantId);
    const dustAmount = await stream.DUST_THRESHOLD();
    const amountMinusDust = unlockedAmount - dustAmount;
    await stream.connect(builder).streamWithdraw(grantId, amountMinusDust, "Withdrawal leaving dust");

    // move to next stage
    const newCap = ethers.parseEther("200");
    await stream.moveGrantToNextStage(grantId, newCap);

    // Withdraw after update
    await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    const newUnlockedAmount = await stream.unlockedGrantAmount(grantId);
    expect(newUnlockedAmount).to.be.closeTo(ethers.parseEther("100"), ethers.parseEther("0.1"));

    const initialBalance = await ethers.provider.getBalance(builder.address);
    await stream.connect(builder).streamWithdraw(grantId, newUnlockedAmount, "Withdrawal after update");
    const finalBalance = await ethers.provider.getBalance(builder.address);

    expect(finalBalance).to.be.gt(initialBalance);

    const grantInfo = await stream.grantStreams(grantId);
    expect(grantInfo.amountLeft).to.be.closeTo(ethers.parseEther("100"), ethers.parseEther("0.1"));
  });

  it("Should emit MoveGrantToNextStage event with correct parameters", async () => {
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    const unlockedAmount = await stream.unlockedGrantAmount(grantId);
    await stream.connect(builder).streamWithdraw(grantId, unlockedAmount, "Withdraw all");

    const newCap = ethers.parseEther("200");
    await expect(stream.connect(deployer).moveGrantToNextStage(grantId, newCap))
      .to.emit(stream, "MoveGrantToNextStage")
      .withArgs(grantId, builder.address, newCap, 1, 2);
  });

  it("Should correctly access builderGrants", async () => {
    // Add a second grant
    await stream.addGrantStream(builder.address, cap, 2);

    const grantCount = await stream.getBuilderGrantCount(builder.address);
    expect(grantCount).to.equal(2);

    // Access each grant
    const firstGrantId = await stream.builderGrants(builder.address, 0);
    expect(firstGrantId).to.equal(grantId);

    const secondGrantId = await stream.builderGrants(builder.address, 1);
    expect(secondGrantId).to.equal(grantId + 1n);

    // Trying to access a non-existent index should revert
    await expect(stream.builderGrants(builder.address, 2)).to.be.reverted;
  });

  it("Should not allow withdrawal after updating grant to zero cap", async () => {
    // Update grant to zero cap
    await stream
      .connect(deployer)
      .updateGrant(grantId, 0, await ethers.provider.getBlock("latest").then(b => b!.timestamp), 0, 1);

    // Try to withdraw (should fail)
    await expect(
      stream.connect(builder).streamWithdraw(grantId, ethers.parseEther("1"), "Attempt withdrawal after zero cap"),
    ).to.be.revertedWithCustomError(stream, "NoActiveStream");

    // Verify grant info
    const grantInfo = await stream.grantStreams(grantId);
    expect(grantInfo.cap).to.equal(0);
    expect(grantInfo.amountLeft).to.equal(0);
  });
});
