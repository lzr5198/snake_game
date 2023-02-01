const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;
    let canvas, ctx;
    let playerNumber;
    let gameActive = false;
    let winner;
    let loser;

    
    const BG_COLOUR = '#231f20';
    const P1_COLOUR = 'red';
    const P2_COLOUR = 'blue';
    const FOOD_COLOUR = '#ffc0cb';
    const SHIELD_COLOUR = '#ffd700';

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");

            // Get the chatroom messages
            // socket.emit("get messages");
        });

        socket.on('init', handleInit);
        socket.on('gameState', handleGameState);
        socket.on('gameOver', handleGameOver);
        socket.on('gameCode', handleGameCode);
        socket.on('unknownCode', handleUnknownCode);
        socket.on('tooManyPlayers', handleTooManyPlayers);

        const gameScreen = document.getElementById('gameScreen');
        const initialScreen = document.getElementById('initialScreen');
        const newGameBtn = document.getElementById('newGameButton');
        const joinGameBtn = document.getElementById('joinGameButton');
        const gameCodeInput = document.getElementById('gameCodeInput');
        const gameCodeDisplay = document.getElementById('gameCodeDisplay');
        const retryBtn = document.getElementById('retryBtn')
        const gameOverPage = document.getElementById('game-over')
        const finalFoodCount = document.getElementById('statistics')
        const displayWinner = document.getElementById('displayWinner')
        

        newGameBtn.addEventListener('click', newGame);
        joinGameBtn.addEventListener('click', joinGame);
        retryBtn.addEventListener('click', retry)

        function newGame() {
            socket.emit('newGame');
            init();
        }
        
        function joinGame() {
            const code = gameCodeInput.value;
            socket.emit('joinGame', code);
            init();
        }

        function retry() {
          // gameOverPage.style.display = "none"
          // initialScreen.style.display = "block"
          window.location.reload()
        }

        let canvas, ctx;
        let playerNumber;
        let gameActive = false;
        let length;
        
        function init() {
          initialScreen.style.display = "none";
          // $( "#initialScreen" ).hide();
          gameScreen.style.display = "block";
          // $( "#gameScreen" ).hide();
        
          canvas = document.getElementById('canvas');
          ctx = canvas.getContext('2d');
        
          canvas.width = canvas.height = 600;
        
          ctx.fillStyle = BG_COLOUR;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        
          document.addEventListener('keydown', keydown);
          gameActive = true;
          length = 0;
        }
        
        function keydown(e) {
          socket.emit('keydown', e.keyCode);
        }
        
        function paintGame(state) {
          ctx.fillStyle = BG_COLOUR;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        
          const food = state.food;
          const shield = state.shield;
          const bombs = state.bombs;
          const gridsize = state.gridsize;
          const size = canvas.width / gridsize;
        
          ctx.fillStyle = FOOD_COLOUR;
          ctx.fillRect(food.x * size, food.y * size, size, size);
          
          ctx.fillStyle = SHIELD_COLOUR;
          ctx.fillRect(shield.x * size, shield.y * size, size, size);
          // console.log(shield.x, shield.y);

          if(bombs){
            for (let b of bombs) {
              if(b.owner == 0){
                // console.log('paint ', b.owner, ' bomb ', b.x, b.y);
                ctx.fillStyle = P1_COLOUR;
                ctx.fillRect(b.x * size, b.y * size, size, size);
              } else if (b.owner == 1) {
                // console.log('paint ', b.owner, ' bomb ', b.x, b.y);
                ctx.fillStyle = P2_COLOUR;
                ctx.fillRect(b.x * size, b.y * size, size, size);
              }
            }
          }
        
          paintPlayer(state.players[0], size, P1_COLOUR);
          paintPlayer(state.players[1], size, P2_COLOUR);
        }
        
        function paintPlayer(playerState, size, colour) {
          const snake = playerState.snake;
        
          ctx.fillStyle = colour;
          for (let cell of snake) {
            ctx.fillRect(cell.x * size, cell.y * size, size, size);
          }
        }
        
        function handleInit(number) {
          playerNumber = number;
        }
        
        function handleGameState(gameState) {
          if (!gameActive) {
            return;
          }
          gameState = JSON.parse(gameState);
          document.getElementById('gameCode').style.display = 'none';
          document.getElementById('gameInfo').style.display = 'block';
          document.getElementById('shield1').innerText = gameState.players[0].shield;
          document.getElementById('shield2').innerText = gameState.players[1].shield;
          requestAnimationFrame(() => paintGame(gameState));
        }
        
        function handleGameOver(data) {
          if (!gameActive) {
            return;
          }
          data = JSON.parse(data);
          
          gameActive = false;
        
          if (data.winner === playerNumber) {
            winner = playerNumber
            if (playerNumber === 1){
              winnerFood = Object.keys(data.gameState.players[0].snake).length - 3;
              loserFood = Object.keys(data.gameState.players[1].snake).length - 3;
              displayWinner.innerText = 1
              finalFoodCount.innerText = "Player 1 ate " + winnerFood + ' food(s)' + '\n' + "Player 2 ate " + loserFood + ' food(s)' + '\n'
            }
            else{
              winnerFood = Object.keys(data.gameState.players[1].snake).length - 3;
              loserFood = Object.keys(data.gameState.players[0].snake).length - 3;
              displayWinner.innerText = 2
              finalFoodCount.innerText = "Player 1 ate " + loserFood + ' food(s)' + '\n' + "Player 2 ate " + winnerFood + ' food(s)' + '\n'
            }
            document.getElementById("game-over").style.display = "block"
            reset();
          } else { //loser
            if (playerNumber === 1){
              winnerFood = Object.keys(data.gameState.players[1].snake).length - 3;
              loserFood = Object.keys(data.gameState.players[0].snake).length - 3;
              displayWinner.innerText = 2
              finalFoodCount.innerText = "Player 1 ate " + loserFood + ' food(s)' + '\n' + "Player 2 ate " + winnerFood + ' food(s)' + '\n'
            }
            else{
              winnerFood = Object.keys(data.gameState.players[0].snake).length - 3;
              loserFood = Object.keys(data.gameState.players[1].snake).length - 3;
              displayWinner.innerText = 1
              finalFoodCount.innerText = "Player 1 ate " + winnerFood + ' food(s)' + '\n' + "Player 2 ate " + loserFood + ' food(s)' + '\n'
            }
            document.getElementById("game-over").style.display = "block"
            reset();
          }
        }
        
        function handleGameCode(gameCode) {
          gameCodeDisplay.innerText = gameCode;
        }
        
        function handleUnknownCode() {
          reset();
          alert('Unknown Game Code')
        }
        
        function handleTooManyPlayers() {
          reset();
          alert('This game is already in progress');
        }
        
        function reset() {
          playerNumber = null;
          gameCodeInput.value = '';
          // initialScreen.style.display = "block";
          gameScreen.style.display = "none";
        }


        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);

            // Show the online users
            OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);

            // Add the online user
            OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);

            // Remove the online user
            OnlineUsersPanel.removeUser(user);
        });

        // Set up the messages event
        socket.on("messages", (chatroom) => {
            chatroom = JSON.parse(chatroom);

            // Show the chatroom messages
            ChatPanel.update(chatroom);
        });

        // Set up the add message event
        socket.on("add message", (message) => {
            message = JSON.parse(message);
            // Add the message to the chatroom
            ChatPanel.addMessage(message);
        });

        // Set up the add typing event
        socket.on("add typing", (name) => {
            ChatPanel.addTyping(name);
        });
        // Set up the clear typing event
        socket.on("clear typing", () => {
            ChatPanel.clearTyping();
        });
    };



    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    // This function sends a post message event to the server
    const postMessage = function(content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };

    // This function sends a start typing signal event to the server
    const startTyping = function() {
        if (socket && socket.connected) {
            socket.emit("typing", true);
        }
    };

    return { getSocket, connect, disconnect, postMessage, startTyping };
})();
