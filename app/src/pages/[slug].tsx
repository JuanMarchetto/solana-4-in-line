import { FC, useEffect, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import { Board } from "../components/Board";
import { useProgram } from "../utils/useProgram";
import { useRouter } from "next/router";

const connection = new web3.Connection(
  ["devnet", "mainnet", "testnet"].includes(process.env.NEXT_PUBLIC_NETWORK)
    ? web3.clusterApiUrl(process.env.NEXT_PUBLIC_NETWORK as web3.Cluster)
    : process.env.NEXT_PUBLIC_NETWORK ?? web3.clusterApiUrl("devnet")
);

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
      <div>
        {!wallet ? (
          <h1 className="text-white">Connect your wallet!</h1>
        ) : (
          <>
          <Board
            board={gameAccount?.board}
            program={program}
            gamePublicKey={gamePublicKey}
            payer={wallet.publicKey}
            playable={gameAccount?.status== "PLAYING"}
          />
          {gameAccount && gameAccount.status != "PLAYING" && (
            <div className="p-5 m-5 font-extrabold text-3xl text-center text-white bg-purple-900">
              {gameAccount.status}
            </div>
          )}
          </>
        )}
      </div>
  );
};

export default CreateGame;
