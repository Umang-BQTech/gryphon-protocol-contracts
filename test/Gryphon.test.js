const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gryphon", function () {
  let gryphon;
  let owner;
  let addr1;
  let addr2;
  let initialSupply;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    initialSupply = ethers.parseEther("1000000"); // 1 million tokens
    const Gryphon = await ethers.getContractFactory("Gryphon");
    gryphon = await Gryphon.deploy(initialSupply);
    await gryphon.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await gryphon.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await gryphon.balanceOf(owner.address);
      expect(await gryphon.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the correct max supply", async function () {
      expect(await gryphon.MAX_SUPPLY()).to.equal(ethers.parseEther("1000000000")); // 1 billion
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await gryphon.mint(addr1.address, mintAmount);
      expect(await gryphon.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should fail when non-owner tries to mint", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        gryphon.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWithCustomError(gryphon, "OwnableUnauthorizedAccount");
    });

    it("Should fail when minting would exceed max supply", async function () {
      const maxSupply = await gryphon.MAX_SUPPLY();
      const currentSupply = await gryphon.totalSupply();
      const tooMuch = maxSupply - currentSupply + ethers.parseEther("1");
      await expect(
        gryphon.mint(addr1.address, tooMuch)
      ).to.be.revertedWithCustomError(gryphon, "ERC20ExceededCap");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint some tokens to addr1 for testing
      await gryphon.mint(addr1.address, ethers.parseEther("1000"));
    });

    it("Should allow users to burn their own tokens", async function () {
      const burnAmount = ethers.parseEther("100");
      await gryphon.connect(addr1).burn(burnAmount);
      expect(await gryphon.balanceOf(addr1.address)).to.equal(
        ethers.parseEther("900")
      );
    });

    it("Should allow users to burn tokens from another address with allowance", async function () {
      const burnAmount = ethers.parseEther("100");
      await gryphon.connect(addr1).approve(addr2.address, burnAmount);
      await gryphon.connect(addr2).burnFrom(addr1.address, burnAmount);
      expect(await gryphon.balanceOf(addr1.address)).to.equal(
        ethers.parseEther("900")
      );
    });

    it("Should fail when burning more than balance", async function () {
      const tooMuch = ethers.parseEther("2000");
      await expect(
        gryphon.connect(addr1).burn(tooMuch)
      ).to.be.revertedWithCustomError(gryphon, "ERC20InsufficientBalance");
    });
  });
}); 