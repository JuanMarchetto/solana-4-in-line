import { web3 } from "@project-serum/anchor";

export const playGame = (program, gamePublicKey, cell, payer, setError) => {
  if (program) {
    (async () => {
      try {
        const tx = await program.methods
          .playGame(cell)
          .accounts({
            game: gamePublicKey,
            payer,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
      } catch (error) { setError(error) }
    })();
  }
};