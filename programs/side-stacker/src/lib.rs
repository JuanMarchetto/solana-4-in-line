use anchor_lang::prelude::*;
use itertools::Itertools;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

const ROWS: usize = 7;
const CELLS_PER_ROW: usize = 7;

#[program]
pub mod side_stacker {
    use super::*;

    pub fn create_game(
        ctx: Context<CreateGame>,
        name: String,
        players: Vec<Pubkey>,
        game_type: String,
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.board = vec![Play::Empty; ROWS * CELLS_PER_ROW];
        game.name = (*name).to_string();
        game.players = players;
        game.status = "PLAYING".to_string();
        game.game_type = game_type;
        emit!(GameCreated { name });
        Ok(())
    }

    pub fn play_game(ctx: Context<Playing>, play: u8) -> Result<()> {
        let game = &mut ctx.accounts.game;
        if game.status != "PLAYING" {
            return Err(error!(ErrorCode::FinishedGame));
        }
        let player = &mut ctx.accounts.payer;
        let turn = (game.turn % 2) as usize;
        if player.key() != game.players[turn] {
            return Err(error!(ErrorCode::IncorrectUser));
        }
        if !is_valid_cell((*game.board).to_vec(), play as usize) {
            return Err(error!(ErrorCode::InvalidCell));
        }
        let mut board = (*game.board).to_vec();
        let cell_value = if turn == 0 { Play::O } else { Play::X };
        board[play as usize] = cell_value;
        game.board = (*board).to_vec();

        if player_win((*board).to_vec(), play as usize) {
            let status = format!(
                "{:#?} Wins!, {:#?} Loss!",
                game.players[turn],
                game.players[turn.checked_add(1).unwrap() % game.players.len()]
            );
            game.status = (*status).to_string();
        } else if game.turn == (ROWS * CELLS_PER_ROW) as u8 - 1 {
            game.status = "TIE".to_string();
        } else {
            game.turn = game.turn.checked_add(1).unwrap();
            if game.game_type == "pc" {
                let possible_pc_cell: Vec<(usize, &Play)> = board
                    .iter()
                    .enumerate()
                    .filter(|(index, cell)| {
                        **cell == Play::Empty && is_valid_cell((*board).to_vec(), *index)
                    })
                    .collect();
                let clock = Clock::get()?;
                let random = clock.unix_timestamp as usize % possible_pc_cell.len();
                let (pc_cell, _) = possible_pc_cell[random];
                board[pc_cell] = if turn == 1 { Play::O } else { Play::X };
                game.board = (*board).to_vec();
                if player_win((*board).to_vec(), pc_cell as usize) {
                    let status = format!("PC Wins!, {:#?} Loss!", game.players[turn]);
                    game.status = (*status).to_string();
                } else {
                    if game.turn == (ROWS * CELLS_PER_ROW) as u8 - 1  {
                        game.status = "TIE".to_string();
                    }
                    game.turn = game.turn.checked_add(1).unwrap();
                }
            }
        }
        emit!(GameUpdated {
            name: (*game.name).to_string(),
            board: (*game.board).to_vec(),
            status: (*game.status).to_string()
        });
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
    pub game_type: String,
    pub board: Vec<Play>,
    pub players: Vec<Pubkey>,
    pub turn: u8,
    pub status: String,
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

#[event]
pub struct GameCreated {
    name: String,
}

#[event]
pub struct GameUpdated {
    name: String,
    board: Vec<Play>,
    status: String,
}

fn player_win(board: Vec<Play>, play: usize) -> bool {
    let relevant_cells_of_player =
        board
            .iter()
            .enumerate()
            .fold([].to_vec(), |mut acc, (index, cell)| {
                if *cell == board[play]
                    && (index % CELLS_PER_ROW == play % CELLS_PER_ROW
                        || index / CELLS_PER_ROW == play / CELLS_PER_ROW
                        || index % (CELLS_PER_ROW + 1) == play % (CELLS_PER_ROW + 1)
                        || index % (CELLS_PER_ROW - 1) == play % (CELLS_PER_ROW - 1))
                {
                    acc.push(index)
                }
                acc
            });
    let mut posible_lines: itertools::Combinations<std::vec::IntoIter<usize>> =
        relevant_cells_of_player.into_iter().combinations(4);
    posible_lines.any(|line| {
        (line[0] / CELLS_PER_ROW == line[3] / CELLS_PER_ROW && line[3] - line[0] == 3)
            || ((((line[0] / CELLS_PER_ROW) + 1 == line[1] / CELLS_PER_ROW)
                && ((line[1] / CELLS_PER_ROW) + 1 == line[2] / CELLS_PER_ROW)
                && ((line[2] / CELLS_PER_ROW) + 1 == line[3] / CELLS_PER_ROW))
                && (((line[0] % CELLS_PER_ROW == line[1] % CELLS_PER_ROW)
                    && (line[1] % CELLS_PER_ROW == line[2] % CELLS_PER_ROW)
                    && (line[2] % CELLS_PER_ROW == line[3] % CELLS_PER_ROW))
                    || (((line[0] % CELLS_PER_ROW) + 1 == line[1] % CELLS_PER_ROW)
                        && ((line[1] % CELLS_PER_ROW) + 1 == line[2] % CELLS_PER_ROW)
                        && ((line[2] % CELLS_PER_ROW) + 1 == line[3] % CELLS_PER_ROW))
                    || ((line[0] % CELLS_PER_ROW == (line[1] % CELLS_PER_ROW) + 1)
                        && (line[1] % CELLS_PER_ROW == (line[2] % CELLS_PER_ROW) + 1)
                        && (line[2] % CELLS_PER_ROW == (line[3] % CELLS_PER_ROW) + 1))))
    })
}

fn is_valid_cell(board: Vec<Play>, play: usize) -> bool {
    board[play] == Play::Empty
        && (play % CELLS_PER_ROW == 0
            || play % CELLS_PER_ROW == (CELLS_PER_ROW - 1)
            || (play > 0 && board[play - 1] != Play::Empty
                || play < board.len() - 1 && board[play + 1] != Play::Empty))
}
