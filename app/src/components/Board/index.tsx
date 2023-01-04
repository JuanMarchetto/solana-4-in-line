import { FC, useState } from "react";
import { playGame } from "../../utils/playGame";

export const Board: FC<any> = ({
  board,
  gamePublicKey,
  program,
  payer,
  playable,
}) => {
  const [error, setError] = useState<any>();
  return (
    <>
      {error && (
        <div className="p-5 text-red text-center bg-white w-full absolute top-40">
          <h1>{error?.message ?? "ups something goes wrong"}</h1>
          <button
            className="p-2 m-2 mx-auto bg-purple-900 text-white mt-5"
            onClick={() => setError(null)}
          >
            Close
          </button>
        </div>
      )}
      <div className="grid gap-4 grid-cols-7 p-2 m-2 mx-auto border border-blue-600 w-80">
        {board?.map((item, index) => (
          <button
            key={index}
            className="h-8 bg-blue-600 text-white text-center font-extrabold"
            onClick={() => {
              !!item.empty &&
                playable &&
                playGame(program, gamePublicKey, index, payer, setError);
            }}
          >
            {`${item.empty ? " " : Object.keys(item)[0]}`}
          </button>
        ))}
      </div>
    </>
  );
};
