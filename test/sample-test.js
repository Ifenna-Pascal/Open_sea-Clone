const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy();
    await market.deployed(); //deploy the NFT market contact 
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    await nft.deployed(); //deploy the NFT contact
    const nftContractAddress = nft.address;
    
    let listingPrice = await market.getListPrice();
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUints("100", "ether");

  // create 2 test tokens
  await nft.createToken("https://www.mytokenlocation.com");
  await nft.createToken("https://www.mytokenlocation2.com");
  
  //create 2 test nfts

  await market.createMarketItem(nftContractAddress, 1, auctionPrice, {value: listingPrice})

  });
});
