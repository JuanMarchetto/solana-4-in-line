### Steps to run this project's Back End:

1. Follow [this guide](https://book.anchor-lang.com/getting_started/installation.html) to install all the needed software
2. Clone this repo:
    `git clone https://github.com/JuanMarchetto/solana-4-in-line.git`
3. Run a local validator
    `solana-test-validator`
4. Open another terminal, cd into the project's folder and install dependencies
    `cd solana-4-in-line && yarn`
5. Build the program
    `anchor build`
6. Set correct program id
    `anchor keys list`
    replace all ocurrences of Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS with the resulting key and save the files
7. Set localhost as target
    `solana config set --url http://localhost:8899`
8. Create a dev CLI wallet
    `solana-keygen new -o "~/.config/solana/id.json"`
9. Airdrop some fake SOL to that wallet
    `solana airdrop 10 "~/.config/solana/id.json"`
10. Deploy and run tests
    `anchor test --skip-local-validator`
    If all test pass you are all set up

### To run this project's Front End:
1. set the endpoint to localhost in `app/src/pages/_app.tsx`
2. run `cd app && yarn && yarn dev`
