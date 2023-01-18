import type { NextPage } from "next";
import Head from "next/head";
import { CreateGame } from "../components/CreateGame";

const Home: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Solana Four in Line Game!</title>
        <meta name="description" content="Solana Four in Line Game!" />
      </Head>
      <CreateGame />
    </>
  );
};

export default Home;
