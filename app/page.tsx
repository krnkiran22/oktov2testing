"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LoginButton } from "@/app/components/LoginButton";
import GetButton from "@/app/components/GetButton";
import { getAccount, getPortfolioNFT, useOkto, nftTransfer, getPortfolioActivity } from '@okto_web3/react-sdk';
import CheckJobStatus from "./components/CheckJobStatus";

export default function Home() {
  const { data: session } = useSession();
  const oktoClient = useOkto();

  //@ts-ignore
  const idToken = useMemo(() => (session ? session.id_token : null), [session]);
const [portfolio, setPortfolio] = useState<[] | null>(null); // State to hold the portfolio data
  const [error, setError] = useState<string | null>(null); // State to hold error messages
  const [nftTransferError, setNftTransferError] = useState<string | null>(null); // Error state for NFT transfer

  async function handleAuthenticate(): Promise<any> {
    if (!idToken) {
      return { result: false, error: "No google login" };
    }
    const user = await oktoClient.loginUsingOAuth({
      idToken: idToken,
      provider: 'google',
    });
    console.log("Authentication Success", user);
    return JSON.stringify(user);
  }

  async function handleLogout() {
    try {
      signOut();
      return { result: "logout success" };
    } catch (error) {
      return { result: "logout failed" };
    }
  }
  async function fetchActivity() {
    try {
        const activities = await getPortfolioActivity(oktoClient);
        console.log('Portfolio activities:', activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
    }
}
  async function handleNFTTransfer() {
    try {
        const transferParams = {
            caip2Id: "eip155:84532",
            collectionAddress: "0xa63f474e9b5e9297c44bb378f27eb3c3882a4544",
            nftId: "11", // NFT token ID
            recipientWalletAddress: "0xC95380dc0277Ac927dB290234ff66880C4cdda8c",
            amount: 1,
            nftType: 'ERC721'
        };

        // Create the user operation
        const userOp = await nftTransfer(oktoClient, transferParams);
        
        // Sign the operation
        const signedOp = await oktoClient.signUserOp(userOp);
        
        // Execute the transfer
        const txHash = await oktoClient.executeUserOp(signedOp);
        console.log('NFT Transfer transaction hash:', txHash);
    } catch (error) {
        console.error('Error in NFT transfer:', error);
    }
}
   async function handleGetPortfolioNFT() {
      try {
        const result = await getPortfolioNFT(oktoClient); // Fetch the portfolio NFT
        console.log(result)
      } catch (error) {
        setError("Failed to retrieve portfolio NFTs.");
        setPortfolio(null);
      }
    }
  

  useEffect(() => {
    if (idToken) {
      handleAuthenticate();
    }
  }, [idToken]);

  return (
    <main className="flex min-h-screen flex-col items-center space-y-6 p-12 bg-violet-200">
      <div className="text-black font-bold text-3xl mb-8">Template App</div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-8">
        <LoginButton />
        <GetButton title="Okto Log out" apiFn={handleLogout} />
        <GetButton title="getAccount" apiFn={getAccount} />
        {/* Pass getPortfolioNFT as apiFn to GetPortfolio */}
       
      </div>
      <div>
      <button
        onClick={handleGetPortfolioNFT}
        className="border border-transparent rounded px-4 py-2 transition-colors bg-blue-500 hover:bg-blue-700 text-white"
      >
        Get Portfolio NFTs
      </button>

      {/* Display Portfolio Result */}
      {portfolio && (
        <div className="mt-4">
          <h3 className="font-bold">Your NFT Portfolio</h3>
          <pre>{JSON.stringify(portfolio, null, 2)}</pre>
        </div>
      )}

      {/* Display Error Message */}
      {error && (
        <div className="mt-4 text-red-500">
          <p>{error}</p>
        </div>
      )}
    </div>
    <button
          onClick={handleNFTTransfer}
          className="mt-4 border border-transparent rounded px-4 py-2 transition-colors bg-green-500 hover:bg-green-700 text-white"
        >
          Transfer NFT
        </button>
        <button 
            className="border border-transparent rounded px-4 py-2 transition-colors bg-blue-500 hover:bg-blue-700 text-white"
            onClick={fetchActivity}>
            Fetch Portfolio Activity
        </button>

        {/* Display NFT Transfer Error Message */}
        {nftTransferError && (
          <div className="mt-4 text-red-500">
            <p>{nftTransferError}</p>
          </div>
        )}
        <CheckJobStatus />
        
    </main>
  );
}