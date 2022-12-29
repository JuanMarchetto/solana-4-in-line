import { FC, useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Board } from "../components/Board";
import { useProgram } from "../utils/useProgram";
import { useRouter } from "next/router";

const endpoint = "http://localhost:8899";
const connection = new anchor.web3.Connection(endpoint);

const CreateGame: FC = ({}) => {
  const router = useRouter();
  const { slug } = router.query;
  const wallet = useAnchorWallet();
  const { program } = useProgram({ connection, wallet });
  const [gamePublicKey, setGamePublicKey] = useState<PublicKey>();
  const [gameAccount, setGameAccount] = useState<any>();
  useEffect(() => {
    if (program) {
      const [pda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("game"), Buffer.from(slug as string)],
        program.programId
      );
      setGamePublicKey(pda);
    }
  }, [wallet]);
  useEffect(() => {
    if (gamePublicKey) {
      (async () => {
        const gameAccount = await program.account.game.fetch(gamePublicKey);
        setGameAccount(gameAccount);
      })();
    }
  }, [gamePublicKey]);
  useEffect(() => console.log(gameAccount), [gameAccount]);
  return (
    <>
      <nav className="flex justify-between items-center px-16 py-4 bg-black">
        <WalletMultiButton />
      </nav>
      {slug}
      <div>
        {!wallet ? (
          <h1 className="text-white">Connect your wallet!</h1>
        ) : (
          <Board board={gameAccount?.board} program={program} gamePublicKey={gamePublicKey} payer={wallet.publicKey}/>
        )}
      </div>
    </>
  );
};

export default CreateGame;
