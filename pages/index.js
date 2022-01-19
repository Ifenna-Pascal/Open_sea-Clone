import styles from '../styles/Home.module.css';
import { ethers } from 'ethers';
import { useEffect, useState }  from 'react';
import Web3Modal from 'web3modal';
import { nftaddress, nftmarketaddress } from '../config';
import Image from 'next/image';
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";


export default function Home() {
  const [nft, setNfts] = useState([]);
  const [loading, setLoading] = useState('not-loaded');

  useEffect(() => {
    loadNFTs()

  }, [])

  async function loadNFTs () {
    const provider = new ethers.providers.JsonRpcProvider();
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
   setLoading('loaded')
  }

  async function BuyNFT (nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    // sign the transaction
    const signer = provider.getSigner();
    const contract = ethers.Contract(nftmarketaddress, Market.abi, signer);

    // set the price
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

    // make the sale
    const transaction = await contract.createMarketSale(nftaddress, nft, tokenId, {value: price})
    await transaction.wait();

    loadNFTs()
  }

  if(loading === "loaded" && !nft.length) return (
    <h1 className='px-20 py-10 text-3xl'>No Item is loaded yet</h1>
  )

  return (
    <div className='flex justify-center'>
      <div className='px-4' style={{ maxWidth: '1600' }}>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
              {
                nft.map((nft,i) => (
                  <div key={i} className='border shadow rounded-xl overflow-hidden'>
                  <Image
                    src={nft.image}
                    alt="Nft Image"
                  />
                    <div className='p-4'> 
                      <p style={{height: "64px"}} className='text-2xl font-semibold'>
                        {nft.name}
                      </p>
                      <div style={{height: '70px', overflow: 'hidden'}}>
                        <p className='text-gray-400'>{nft.description}</p>
                      </div>
                    </div>
                    <div className='p-4 bg-black'>
                        <p className='text-2xl mb-4 font-bold text-white'>
                          {nft.price} ETH
                        </p>
                        <button className='w-full bg-pink-500 text-white font-bold py-2 px-12 rounded' onClick={() => BuyNFT(nft)}>Buy NFT</button>
                    </div>
                  </div>
                ))
              }
          </div>
      </div>
    </div>
  )
}
