import type { NextPage } from "next";
import Head from "next/head";
import { CreateGame } from "../components/CreateGame";

const Home: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Solana Side Stacker Game!</title>
        <meta name="description" content="Solana Side Stscker Game!" />
      </Head>
      <CreateGame />
    </>
  );
};

export default Home;
