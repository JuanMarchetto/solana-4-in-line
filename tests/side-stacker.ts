import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SideStacker } from "../target/types/side_stacker";
import { PublicKey, SystemProgram } from "@solana/web3.js"
import * as web3 from "@solana/web3.js"

describe("side-stacker", () => {
  const name = "Test Game"

  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SideStacker as Program<SideStacker>;
  const payer = (program.provider as anchor.AnchorProvider).wallet;
  const player2 = new PublicKey("EjPpXXDykPawauyZHsBMtxGwG7K4iFmxdvB6ockM56ZN")

  const [pdaPublicKey] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("game"), Buffer.from(name)],
    program.programId,
  )

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.createGame(
      name,
      [
        payer.publicKey,
        player2
      ]
    )
      .accounts({
        payer: payer.publicKey
      })
      .rpc();
    console.log("Your transaction signature", tx);
    const games = await program.account.game.all()
    console.log(games)
  });
});
