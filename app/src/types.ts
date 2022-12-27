import * as anchor from "@project-serum/anchor";

export type AccountData = {
  content: string;
  x: Number;
  y: Number;
};
export type PostIt = {
  publicKey: anchor.web3.PublicKey;
  content: string;
  x: Number;
  y: Number;

}
