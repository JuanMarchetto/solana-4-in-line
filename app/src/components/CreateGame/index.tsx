import { FC, useEffect, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import { useRouter } from "next/router";
import { useConnection } from "@solana/wallet-adapter-react";
import { useProgram } from "../../utils/useProgram";
import Link from "next/link";

export const CreateGame: FC = ({}) => {
  const wallet = useAnchorWallet();
  const router = useRouter();
  const { connection } = useConnection();
  const { program } = useProgram({ connection, wallet });
  const [player2, setPlayer2] = useState("pc");
  const [name, setName] = useState("");
  const [error, setError] = useState<any>();
  const [created, setCreated] = useState<boolean>(false);
  const handleClick = () => {
    if (program) {
      (async () => {
        const player2Key = player2 == "pc" ? player2 : new PublicKey(player2);
        const [gamePublicKey] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from("game"), Buffer.from(name)],
          program.programId
        );
        try {
          const tx = await program.methods
            .createGame(name, player2 == "pc" ? [wallet.publicKey] :[wallet.publicKey, player2Key], "pc")
            .accounts({
              game: gamePublicKey,
              payer: wallet?.publicKey,
              systemProgram: web3.SystemProgram.programId,
            })
            .rpc();
          setCreated(true);
        } catch (error) {
          setError(error);
        }
      })();
    }
  };

  useEffect(() => {
    if (!program) return;
    const listener = program.addEventListener(
      "GameCreated",
      async (event, _slot, _sig) => {
        router.push(`/${name}`);
      }
    );

    return () => {
      program.removeEventListener(listener);
    };
  }, [program]);

  return error ? (
    <h1 className="text-white">
      {error?.message ?? "ups something goes wrong"}
    </h1>
  ) : (
    <div className="flex flex-col p-5">
      {!wallet ? (
        <h1 className="text-white">Connect your wallet!</h1>
      ) : (
        <>
          <input
            placeholder="Gave your game a name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-5 mb-5"
          />
          <input
            placeholder="Copy your friends wallet here"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            className="p-5 mb-5"
          />
          <button
            type="button"
            onClick={player2 && handleClick}
            className="bg-purple-700 text-white font-extrabold p-2 px-4 rounded-lg"
          >
            Create Game!
          </button>
          {created && (
            <div className="text-white text-center mt-5">
              <strong>
                If this don't redirect you automatically{" "}
                <Link href={`/${name}`}>Click here</Link>
              </strong>
            </div>
          )}
        </>
      )}
    </div>
  );
};
