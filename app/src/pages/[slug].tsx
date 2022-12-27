import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useConnection } from '@solana/wallet-adapter-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { useProgram } from '../utils/useProgram';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useMemo, useState } from 'react';
import * as anchor from '@project-serum/anchor';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { IdlTypes } from '@project-serum/anchor';
import { IdlAccountDef } from '@project-serum/anchor/dist/cjs/idl';
import { TypeDef } from '@project-serum/anchor/dist/cjs/program/namespace/types';

const Home: NextPage = (props) => {
  const endpoint = 'http://localhost:8899';
  const connection = new anchor.web3.Connection(endpoint);
  const wallet = useAnchorWallet();
  const { program } = useMemo(() => useProgram({ connection, wallet }), [connection, wallet]);
  const router = useRouter();
  const { slug } = router.query;
  const playerPublicKey = new PublicKey(slug);

  const [game, setGame] = useState<TypeDef<IdlAccountDef, anchor.IdlTypes<anchor.Idl>> | null>();
  const [gamePublicKey, setGamePublicKey] = useState<web3.PublicKey | null>()
  useEffect(() => {
    if (program && !game) {
      (async () => {
        const [publicKey] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from('game'), playerPublicKey.toBuffer() ?? Buffer.from('')],
          program.programId
        );
        setGamePublicKey(publicKey)
        const gameAccount = await program.account.game.fetch(publicKey);
        setGame(gameAccount);
      })();
    }
  }, [program]);

  return (
    <>
      <p>{slug}</p>
      <WalletMultiButton />
      <button type='button' onClick={()=>{
        (async ()=> {
          console.log(game)
              const tx = await program.methods.applyMove(
                2,
                3
              ).accounts({
                game: gamePublicKey,
                payer: wallet?.publicKey,
                systemProgram: web3.SystemProgram.programId,
              })
                .rpc();
          
              const gameAccount = await program.account.game.fetch(gamePublicKey);
              console.log(gameAccount);
                console.log(`https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http://localhost:8899`);
            })()
      }}>algo</button>
    </>
  );
};

export default Home;
