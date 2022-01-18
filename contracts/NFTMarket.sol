//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// prevent reentrancy attacks.
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; 

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    // owner of the smart contract
    address payable owner; 
    // amount to pay to enlist someone's NFT on the marketplace;
    uint256 listingPrice = 0.025 ether; 

    constructor () {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint price;
        bool sold;
    }

    mapping (uint => MarketItem) private idMarketItem;

    event MarketItemDetails (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint price,
        bool sold
    );

    /// @notice function to get listing price
    function getListPrice () public view returns (uint256) {
        return listingPrice;
    }

    /// @notice function to create new market item
    function createMarketItem (address nftContract, uint tokenId, uint256 price ) public payable nonReentrant {
        require(price > 0, "Price must be above zero");
        require (msg.value == listingPrice, "Price must be equal to the listing price");
        _itemIds.increment(); 
        uint256 itemId = _itemIds.current();
        idMarketItem[itemId]  = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender), // address of the person putting up the item for sale
            payable(address(0)), // address of the owner
            price,
            false
        );
        // transfering ownership of the nft to the contract itself
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        // emit market_details event
        emit MarketItemDetails(itemId, nftContract, tokenId, msg.sender, address(0), price, false);
    }

    /// @notice function to create a market sale
    function createMarketSale (address nftContract, uint itemId) public payable nonReentrant {
        uint price = idMarketItem[itemId].price;
        uint tokenId = idMarketItem[itemId].tokenId;
        require(msg.value == price, "Please submit the required price to complete purchase");
        idMarketItem[itemId].seller.transfer(msg.value);

        // transfer ownership from the contract to the buyer
         IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        
        idMarketItem[itemId].owner = payable(msg.sender); // marks buyer as new seller
        idMarketItem[itemId].sold = true; // marks that the nft has been sold
        _itemsSold.increment(); //increment the total number of items sold on the platform
        payable(owner).transfer(listingPrice); // pay owner of the contract the actual listing price
    }
}
 