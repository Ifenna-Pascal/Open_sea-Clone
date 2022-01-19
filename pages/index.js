import styles from '../styles/Home.module.css';
import { ethers } from 'ethers';
import { useEffect, useState }  from 'react';
import Web3Modal from 'web3modal';
import { nftaddress, nftmarketaddress } from '../config';

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";


export default function Home() {
  const [nft, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNFTs()

  }, [])

  async function loadNFTs () {
    const provider = new ethers.provider.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider);

    const data = await marketContract.fetchMarketItems();
   const items = await Promise.all(data.map(async i => {
    const tokenUri = await tokenContract.tokenURI(i.tokenId);
    const meta = await axios.get(tokenUri);
    let price = ethers.utils.formatUnits(i.price.toString(), "ether");
    let item = {
      price,
      tokenId: i.tokenId.toNumber(),
      seller: i.seller,
      owner: i.owner,
      image: meta.data.image,
      description: meta.data.description
    }
    return item;
   }))

   setNfts(items);
   setLoading(true)
  }

  function BuyNFT () {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    // sign
  }

  if(!loading && !nft.length) return (
    <h1 className='px-20 py-10 text-3xl'>No Item is loaded yet</h1>
  )

  return (
    <div className={styles.container}>
      <h4>Welcome To Home</h4>
    </div>
  )
}
