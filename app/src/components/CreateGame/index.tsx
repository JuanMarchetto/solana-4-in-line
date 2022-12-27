import { FC, useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js"
import * as web3 from "@solana/web3.js"
import * as anchor from "@project-serum/anchor";
import { useConnection } from "@solana/wallet-adapter-react"

import { useProgram } from "../../utils/useProgram";

const endpoint = "http://localhost:8899";
const connection = new anchor.web3.Connection(endpoint);

export const CreateGame: FC = ({ }) => {
  //const { connection } = useConnection()
  const wallet = useAnchorWallet();
  const { program } = useProgram({ connection, wallet });

  const handleClick = ()=>{
    if (program){
    (async () =>{


  const player1 = new PublicKey("GgZqidq5shJkSZmejx92RTMz2Ti82VxXRdxtKjFKLntC")
  const player2 = new PublicKey("GgZqidq5shJkSZmejx92RTMz2Ti82VxXRdxtKjFKLntC")
  const name = "test"
  
    const [gamePublicKey] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game"), Buffer.from(name),],
      program.programId,
    )
  
  
      const tx = await program.methods.createGame(
        name,
        [player1, player2]
      ).accounts({
        game: gamePublicKey,
        payer: wallet?.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
        .rpc();
        console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http://localhost:8899`);

    })()
  }
 
  }
  return (
    <>
      <nav className="flex justify-between items-center px-16 py-4 bg-black">
        <WalletMultiButton />
      </nav>
      {!wallet ? (
        <p> no wallet </p>
      ) : (
        <button type="button" onClick={handleClick}> wallet </button>
      )}
    </>
  );
};

