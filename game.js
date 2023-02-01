const { GRID_SIZE } = require('./constants');
// const sounds = {
//     background: new Audio("../sonuds/background.mp3"),
//     collect: new Audio("../sonuds/collect.mp3"),
//     gameover: new Audio("../sonuds/gameover.mp3")
// };


module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
  updateBomb,
  cheat,
}

function initGame() {
  const state = createGameState()
  randomFood(state);
  randomShield(state);
  return state;
}

function createGameState() {
  return {
    players: [{
      pos: {
        x: 5,
        y: 10,
      },
      vel: {
        x: 0,
        y: 0,
      },
      snake: [
        {x: 3, y: 10},
        {x: 4, y: 10},
        {x: 5, y: 10},
      ],
      shield: 0,
      cheat: false,
    }, {
      pos: {
        x: 25,
        y: 10,
      },
      vel: {
        x: 0,
        y: 0,
      },
      snake: [
        {x: 27, y: 10},
        {x: 26, y: 10},
        {x: 25, y: 10},
      ],
      shield: 0,
      cheat: false,
    }],

    food: {},
    shield: {},
    bombs: [],
    gridsize: GRID_SIZE,
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;

  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  // hit wall
  if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
    if(!playerOne.cheat) return 2;
  }

  if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
  if(!playerTwo.cheat) return 1;
  }

  // no hit wall
  if(playerOne.cheat){
    if (playerOne.pos.x <= 0){
      playerOne.pos.x = GRID_SIZE + playerOne.pos.x;
    } 
    if (playerOne.pos.y <= 0) {
      playerOne.pos.y = GRID_SIZE + playerOne.pos.y;
    } 
    if (playerOne.pos.x >= GRID_SIZE) {
      playerOne.pos.x = 0;
    }
    if (playerOne.pos.y >= GRID_SIZE) {
      playerOne.pos.y = 0;
    }}

  if(playerTwo.cheat){
    if (playerTwo.pos.x <= 0){
      playerTwo.pos.x = GRID_SIZE + playerTwo.pos.x;
    } 
    if (playerTwo.pos.y <= 0) {
      playerTwo.pos.y = GRID_SIZE + playerTwo.pos.y;
    } 
    if (playerTwo.pos.x >= GRID_SIZE) {
      playerTwo.pos.x = 0;
    }
    if (playerTwo.pos.y >= GRID_SIZE) {
      playerTwo.pos.y = 0;
    }
  }

  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    // sounds.collect.play();
    randomFood(state);
  }

  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;
    // let audio = new Audio('./sound/collect.mp3')
    // audio.play()
    // sounds.collect.play();
    randomFood(state);

  }


  if (state.shield.x === playerOne.pos.x && state.shield.y === playerOne.pos.y) {
    // playerOne.pos.x += playerOne.vel.x;
    // playerOne.pos.y += playerOne.vel.y;
    // console.log("shield", "p1");
    state.players[0].shield++;
    // sounds.collect.play();
    randomShield(state);
  }

  if (state.shield.x === playerTwo.pos.x && state.shield.y === playerTwo.pos.y) {
    // playerTwo.pos.x += playerTwo.vel.x;
    // playerTwo.pos.y += playerTwo.vel.y;
    // console.log("shield", "p2");
    state.players[1].shield++;
    // let audio = new Audio('./sound/collect.mp3')
    // audio.play()
    randomShield(state);
  }


  if (playerOne.vel.x || playerOne.vel.y) {
    // // eat it self
    // for (let cell of playerOne.snake) {
    //   if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
    //     return 2;
    //   }
    // }

    // // eat oponent
    // let head = true;
    // for (let cell of playerOne.snake) {
    //   if (head) {
    //     head = false;
    //     continue;
    //   }
    //   if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
    //     return 2;
    //   }
    // }

    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }

  if (playerTwo.vel.x || playerTwo.vel.y) {
    // for (let cell of playerTwo.snake) {
    //   if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
    //     return 1;
    //   }
    // }

    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
  }

  if (state.bombs) {
    // for (let b of state.bombs) {
    //   if (b.owner==0 && b.x === playerTwo.pos.x && b.y === playerTwo.pos.y) {
    //     state.players[1].shield--;
    //     // console.log('p2 remaining shield=', state.players[1].shield);
    //     if(state.players[1].shield < 0) {
    //       return 1
    //     }
    //   } 
    //   if (b.owner==1 && b.x === playerOne.pos.x && b.y === playerOne.pos.y) {
    //     state.players[0].shield--;
    //     // console.log('p1 remaining shield=', state.players[1].shield);
    //     if(state.players[1].shield < 0) {
    //       return 2;
    //     }
    //   }
    // }

    for (var i = state.bombs.length - 1; i >= 0; i--) {
      let owner = state.bombs[i].owner;
      let x = state.bombs[i].x;
      let y = state.bombs[i].y;
        if (owner==0 && x === playerTwo.pos.x && y === playerTwo.pos.y) {
          state.players[1].shield--;

          // console.log('p2 remaining shield=', state.players[1].shield);
          if(state.players[1].shield < 0) {
            // console.log('p1 won');
            return 1
          }

          // remove the bomb
          state.bombs.splice(i, 1);
        } 
        if (owner==1 && x === playerOne.pos.x && y === playerOne.pos.y) {
          state.players[0].shield--;

          // console.log('p1 remaining shield=', state.players[1].shield);
          if(state.players[0].shield < 0) {
            // console.log('p2 won');
            return 2;
          }

          // remove the bomb
          state.bombs.splice(i, 1);
        }
    }
  }

  return false;
}

function randomFood(state) {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  }

  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  state.food = food;
}


function randomShield(state) {
  shield = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  }

  for (let cell of state.players[0].snake) {
    if (cell.x === shield.x && cell.y === shield.y) {
      state.players[0].shield += 1;
      return randomShield(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.x === shield.x && cell.y === shield.y) {
      state.players[1].shield += 1;
      return randomShield(state);
    }
  }

  
  // console.log(shield.x, shield.y);
  state.shield = shield;
}



function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    case 37: { // left
      return { x: -1, y: 0 };
    }
    case 38: { // down
      return { x: 0, y: -1 };
    }
    case 39: { // right
      return { x: 1, y: 0 };
    }
    case 40: { // up
      return { x: 0, y: 1 };
    }
  }
}


function updateBomb(pNum, state) { // pNum = 0 or 1
  bomb = {
    x: state.players[pNum].pos.x,
    y: state.players[pNum].pos.y,
    owner: pNum
  }
  
  // console.log(bomb.owner, 'bomb', bomb.x, bomb.y);
  state.bombs.push(bomb);
}


function cheat(pNum, state) { // pNum = 0 or 1
  state.players[pNum].cheat = true;
  // console.log("cheating");
  // if(state.players[pNum].cheat){
  //   state.players[pNum].cheat = false;}
  // else{
  //   state.players[pNum].cheat = true;}
}