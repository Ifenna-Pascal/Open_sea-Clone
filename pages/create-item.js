import { useState } from "react";
import { ethers } from "ethers";
import {  create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import web3Modal from 'web3modal'; 

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function CreateItem (){
    const [fileUrl, setFileUrl] = useState(null);
    const [formInput, updateFormInput] = useState({price:'', name:'', description:''});
    const router = useRouter();

    async function onChange(e) {
        const file = e.target.file[0];
        try {
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`recieved, ${prog}`)
                }
            )
            // file saved in the URL path below
            const usrl = `https://ipfs.infura.io/ipfs/${added.path}`;
            setFileUrl(url);
        } catch (e) {
            
        }
    }
}