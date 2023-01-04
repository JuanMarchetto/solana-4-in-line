import { FC } from "react";
import { playGame } from "../../utils/playGame";

export const Board: FC<any> = ({
  board,
  gamePublicKey,
  program,
  payer,
  playable,
}) => (
  <div className="grid gap-4 grid-cols-7 p-2 m-2 mx-auto border border-blue-600 w-80">
    {board?.map((item, index) => (
      <button
        key={index}
        className="h-8 bg-blue-600 text-white text-center font-extrabold"
        onClick={() => {
          !!item.empty &&
            playable &&
            playGame(program, gamePublicKey, index, payer);
        }}
      >
        {`${item.empty ? " " : Object.keys(item)[0]}`}
      </button>
    ))}
  </div>
);
