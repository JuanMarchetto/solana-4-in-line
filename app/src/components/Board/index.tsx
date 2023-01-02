import { FC } from "react";
import { playGame } from "../../utils/playGame";

export const Board: FC<any> = ({ board, gamePublicKey, program, payer }) => (
  <div className="grid gap-4 grid-cols-7 p-2 border border-blue-600">
    {board?.map((item, index) => (
      <button
        className="p-5 h-4 bg-blue-600 text-white flex"
        onClick={() => 
          !!item.empty && playGame(program, gamePublicKey, index, payer)
        }
      >
        {`${item.empty ? " " : Object.keys(item)[0]}`}
      </button>
    ))}
  </div>
);
