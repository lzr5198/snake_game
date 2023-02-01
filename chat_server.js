const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();


// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, avatar, name, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const fs = require("fs");
    const users = JSON.parse(fs.readFileSync("data/users.json"));
    // console.log(users);

    //
    // E. Checking for the user data correctness
    //
    // console.log('username=', username, '!username=', !username);
    if (!username){
        res.json({ status: "error", error: 'username cannot be empty'});
        return;}
    else if(!containWordCharsOnly(username)){
        res.json({ status: "error", error: 'The username can contain only underscores, letters or numbers'});
        return;}
    else if(username in users){
        res.json({ status: "error", error: 'username alread exits'});
        return;}
    else if (!avatar){
        res.json({ status: "error", error: 'avatar cannot be empty'});
        return;}
    else if (!name){
        res.json({ status: "error", error: 'name cannot be empty'});
        return;}
    else if (!password){
        res.json({ status: "error", error: 'password cannot be empty'});
        return;}

    //
    // G. Adding the new user account
    //
    const hash = bcrypt.hashSync(password, 10);
    users[username] = {
        "avatar": avatar,
        "name": name,
        "password": hash
    };
    // console.log(users);

    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("data/users.json", JSON.stringify(users, null, " " ));

    //
    // I. Sending a success response to the browser
    //
    res.json({ status: "success" });

    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const fs = require("fs");
    const users = JSON.parse(fs.readFileSync("data/users.json"));
    // console.log(users);


    //
    // E. Checking for username/password
    //
    if (username in users) {
        hashedPassword = users[username]["password"];
        if(!bcrypt.compareSync(password, hashedPassword)){
            res.json({ status: "error", error: 'the password does not match'});
            return;}
    } else {
        res.json({ status: "error", error: 'username does not exist'});
        return;
    }


    //
    // G. Sending a success response with the user account
    // username, avatar, name
    account = {"username":username, "avatar":users[username]["avatar"], "name":users[username]["name"]};
    req.session.user = account;
    res.json({ status: "success", user: account});
 
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    user = req.session.user;

    //
    // D. Sending a success response with the user account
    //
    if (user) {
        res.json({ status: "success", user: user});
    } else {
        res.json({ status: "error", error:'have not signed in yet.' });
        return;
    }


 
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    req.session.user = null;

    //
    // Sending a success response
    //
    res.json({ status: "success"});
 
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});


//
// ***** Please insert your Lab 6 code here *****
//
// create Socket.IO server
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer( app );
const io = new Server(httpServer);

httpServer.listen(8000, () => {
    console.log("The chat server has started...");
});


io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});


//  {"tony": { avatar: "Owl",    name: "Tony Lee" }, ... }
const onlineUsers = {};

const { initGame, gameLoop, getUpdatedVelocity, updateBomb, cheat } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};

io.on("connection", ( clientSocket ) => {
    // ...Doing things for the connected browser...
    account = clientSocket.request.session.user;
    // username1 = account[username]; // undefined
    if (account) {
        onlineUsers[account.username] = {avatar:account.avatar, name:account.name};
        // console.log("new connection from", account.username, ",current list=", onlineUsers);
        io.emit("add user", JSON.stringify(clientSocket.request.session.user)); 
    }
    
    clientSocket.on("disconnect", () => {
        // Remove the user from the online user list
        account = clientSocket.request.session.user; // IMPORTANT: have to update this variable to load the discoonecting account instead of the lasted connected account. 
        if (account) {
            delete onlineUsers[account.username];
            io.emit("remove user", JSON.stringify(clientSocket.request.session.user)); 
            // console.log(account.username, "disconnected", ",current list=", onlineUsers);
        }
    });


    clientSocket.on("get users", () => {
        // Send the online users to the browser
        clientSocket.emit("users", JSON.stringify(onlineUsers)); 
    });


    clientSocket.on('keydown', handleKeydown);
    clientSocket.on('newGame', handleNewGame);
    clientSocket.on('joinGame', handleJoinGame);

    function handleKeydown(keyCode) {
        const roomName = clientRooms[clientSocket.id];
        if (!roomName) {
          return;
        }
        try {
          keyCode = parseInt(keyCode);
        } catch(e) {
          console.error(e);
          return;
        }
        
        let vel = null;

        if(keyCode == 32){
            // add a bomb to state
            updateBomb(clientSocket.number - 1, state[roomName]);
        } else if(keyCode == 67) {
            cheat(clientSocket.number - 1, state[roomName]);
        } else {
            vel = getUpdatedVelocity(keyCode);
        }
    
        // console.log('handleKeydown', state[roomName].shield);

        if (vel) {
            let prev = state[roomName].players[clientSocket.number - 1].vel;
            if(vel.x != 0 && -vel.x != prev.x) {
                state[roomName].players[clientSocket.number - 1].vel = vel;
            } else if(vel.y != 0 && -vel.y != prev.y) {
                state[roomName].players[clientSocket.number - 1].vel = vel;
            }

        }
    }


    function handleNewGame() {
        let roomName = makeid(5);
        clientRooms[clientSocket.id] = roomName;
        clientSocket.emit('gameCode', roomName);
        state[roomName] = initGame();
        clientSocket.join(roomName);
        clientSocket.number = 1;
        clientSocket.emit('init', 1);
    }

    function handleJoinGame(roomName) {
        // io.sockets.adapter.rooms returns a map of all current rooms (from id to set ???) .
        // const room = io.sockets.adapter.rooms[roomName];
        // console.log(io.sockets.adapter.rooms.get(roomName).size);

        // let allUsers;
        // if (room) {
        //   allUsers = room.sockets;
        // }
    
        // let numClients = 0;
        // if (allUsers) {
        //   numClients = Object.keys(allUsers).length;
        // }
    
        let numClients = 0;
        if(io.sockets.adapter.rooms.has(roomName)){
            numClients = io.sockets.adapter.rooms.get(roomName).size;
        }

        if (numClients === 0) {
            clientSocket.emit('unknownCode');
          return;
        } else if (numClients > 1) {
            clientSocket.emit('tooManyPlayers');
          return;
        }
    
        clientRooms[clientSocket.id] = roomName;
    
        clientSocket.join(roomName);
        clientSocket.number = 2;
        clientSocket.emit('init', 2);
        
        startGameInterval(roomName);
      }


    function startGameInterval(roomName) {
        const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);
        // console.log('Interval: ', state[roomName].shield, state[roomName].food); // update failed
        
        if (!winner) {
            emitGameState(roomName, state[roomName])
        } else {
            emitGameOver(roomName, winner, state[roomName]);
            state[roomName] = null;
            clearInterval(intervalId);
        }
        }, 1000 / FRAME_RATE);
    }
    
    function emitGameState(room, gameState) {
        // console.log('emitstate: s=', gameState.shield, 'f=', gameState.food); // 

        // Send this event to everyone in the room.
        io.sockets.in(room).emit('gameState', JSON.stringify(gameState));
    }
    
    function emitGameOver(room, winner, gameState) {
        console.log('gamerover\n');
        io.sockets.in(room).emit('gameOver', JSON.stringify({ winner, gameState }));
    }

    // clientSocket.on("get messages", () => {
    //     // Send the chatroom messages to the browser
    //     const msg = JSON.parse(fs.readFileSync("data/chatroom.json"));
    //     clientSocket.emit("messages", JSON.stringify(msg));
    // });


    // clientSocket.on("post message", (content) => {
    //     // Add the message to the chatroom
    //     msg = {
    //         user:     clientSocket.request.session.user,
    //         datetime: new Date(),
    //         content:  content,
    //     };

    //     const chat = JSON.parse(fs.readFileSync("data/chatroom.json"));
    //     chat.push(msg);
    //     fs.writeFileSync("data/chatroom.json", JSON.stringify(chat, null, " " ));
        
    //     io.emit("add message", JSON.stringify(msg));
    // });
    

    // var active;
    // var timeout = 3000;
    // var idleTimer;
    // clientSocket.on("typing", () => {
    //     active = true;
    //     clientSocket.broadcast.emit("add typing", clientSocket.request.session.user.name);
        
    //     detectIdle();
    // });

    // function detectIdle(){
    //     if (idleTimer) {
    //         clearInterval(idleTimer);
    //     }
    //     active = false;
        
    //     idleTimer = setTimeout(function(){
    //         if(!active) io.emit("clear typing");
    //     }, timeout);
    // }

    
});

