use anchor_lang::prelude::*;
use itertools::Itertools;

declare_id!("FP5Z91hucXhZV4vueLTLW9esymzuWzz8oS7EmEKVMjDr");

#[program]
pub mod side_stacker {
    use super::*;

    pub fn create_game(ctx: Context<CreateGame>, name: String, players: Vec<Pubkey>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.board = vec![Play::Empty; 49];
        game.name = name;
        game.players = players;
        game.ended = false;
        Ok(())
    }

    pub fn play_game(ctx: Context<Playing>, play: u8) -> Result<()> {
        let game = &mut ctx.accounts.game;
        if game.ended {
            return Err(error!(ErrorCode::FinishedGame));
        }
        let player = &mut ctx.accounts.payer;
        let turn = (game.turn % 2) as usize;
        if player.key() != game.players[turn] {
            return Err(error!(ErrorCode::IncorrectUser));
        }
        let is_valid_cell = game.board[play as usize] == Play::Empty
            && (play % 7 == 0
                || play % 7 == 6
                || (play > 0 && game.board[play as usize - 1] != Play::Empty
                    || (play as usize) < game.board.len() - 1
                        && game.board[play as usize + 1] != Play::Empty));
        if !is_valid_cell {
            return Err(error!(ErrorCode::InvalidCell));
        }
        let mut board = (*game.board).to_vec();
        let cell_value = if turn == 0 { Play::O } else { Play::X };
        board[play as usize] = cell_value;
        game.board = board;
        let cells_of_player =
            game.board
                .iter()
                .enumerate()
                .fold([].to_vec(), |mut acc, (index, cell)| {
                    if *cell == game.board[play as usize] {
                        acc.push(index)
                    }
                    acc
                });
        let posible_lines: Vec<Vec<usize>> = cells_of_player.into_iter().combinations(4).collect();
        let player_win = posible_lines.iter().any(|line| {
            (line[0] / 7 == line[3] / 7 && line[3] - line[0] == 3)
                || (((line[0] / 7 == (line[1] / 7) - 1)
                    && (line[1] / 7 == (line[2] / 7) - 1)
                    && (line[2] / 7 == (line[3] / 7) - 1))
                    && (((line[0] % 7 == line[1] % 7)
                        && (line[1] % 7 == line[2] % 7)
                        && (line[2] % 7 == line[3] % 7))
                        || ((line[0] % 7 == (line[1] % 7) - 1)
                            && (line[1] % 7 == (line[2] % 7) - 1)
                            && (line[2] % 7 == (line[3] % 7) - 1))
                        || ((line[0] % 7 == (line[1] % 7) + 1)
                            && (line[1] % 7 == (line[2] % 7) + 1)
                            && (line[2] % 7 == (line[3] % 7) + 1))))
        });
        if player_win {
            game.ended = true;
        } else {
            game.turn = game.turn.checked_add(1).unwrap();
        }
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateGame<'info> {
    #[account(
        init,
        payer = payer,
        space = 900,
        seeds = [b"game".as_ref(), name.as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
    /// CHECK:
    #[account(mut)]
    pub payer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Playing<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    /// CHECK:
    #[account(mut)]
    pub payer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Game {
    pub name: String,
    pub board: Vec<Play>,
    pub players: Vec<Pubkey>,
    pub turn: u8,
    pub ended: bool,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum Play {
    Empty,
    X,
    O,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Isn't your turn to play")]
    IncorrectUser,
    #[msg("You can't use this cell now")]
    InvalidCell,
    #[msg("You can't play, this game status is ended")]
    FinishedGame,
}
