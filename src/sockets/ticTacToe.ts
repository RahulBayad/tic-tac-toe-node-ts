import { Server } from "socket.io";
import { app } from "../app";
import { createServer } from "http";

type Room = {
  roomId: string;
  player1: string | undefined;
  player2: string | undefined;
  gameState: string[];
  playerTurn: string;
  currentMove: "X" | "Y";
  winner: null | string;
};

const ticTacToeServer = createServer(app);
const io = new Server(ticTacToeServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
  },
});

// Variables Declarations
const available: string[] = [];
const rooms: Room[] = [];
const newRoom = (
  roomId: string,
  player1: string,
  player2: string | undefined
): Room => {
  return {
    roomId,
    player1,
    player2,
    gameState: Array(9).fill(null),
    playerTurn: player1,
    currentMove: "X",
    winner: null,
  };
};

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  const checkWinner = (gameState: string[]) => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        gameState[a] &&
        gameState[a] === gameState[b] &&
        gameState[a] === gameState[c]
      ) {
        return gameState[a];
      }
    }
    return null;
  };

io.on("connection", (socket) => {
  console.log("connected", socket.id);

  socket.on("disconnect", () => {
    console.log("disconnected");
  });

  socket.on("findopponent", () => {
    console.log("Finding Opponent");
    socket.emit("findingOpponent", "I am finding an opponent");

    if (available.length === 0) {
      available.push(socket.id);
    } else {
      const player1 = socket;
      const player2 = io.sockets.sockets.get(available[0] as string);

      const roomId = player2?.id + "_" + player1?.id;

      player1.join(roomId);
      player2?.join(roomId);

      available.pop();

      io.to(roomId).emit("gameCreated", {
        roomId,
        // opponent: player2?.id,
        gameState: Array(9).fill(null),
        playerTurn: player1.id,
        currentMove: "X",
        winner: null,
      });
      rooms.push(newRoom(roomId, player1?.id, player2?.id));
    }
  });

  socket.on(
    "make-move",
    (response: { 
        roomId: string; 
        gameState: string[]; 
        playerTurn: string;
        currentMove: string;
        winner: null;
    }) => {
      const currentRoom = rooms.filter(
        (rm) => rm.roomId === response.roomId
      )[0];

      // Response
      // {gameState, roomId, currentMove, playerTurn}

      currentRoom.playerTurn =
        response?.playerTurn === currentRoom?.player1
          ? currentRoom.player2
          : currentRoom.player1;

      currentRoom.currentMove = response?.currentMove === "X" ? "Y" : "X";
      currentRoom.gameState = response?.gameState

      const winner = checkWinner(currentRoom.gameState)
      currentRoom.winner = !winner ? null : socket.id

      if(winner){
        io.to(currentRoom.roomId).emit("won",{
            winner: !winner ? null : socket.id
        })
      }else{
        io.to(currentRoom.roomId).emit("get-move",{
            roomId: currentRoom.roomId,
            gameState: currentRoom.gameState,
            playerTurn: currentRoom.playerTurn,
            currentMove: currentRoom.currentMove,
            winner: currentRoom.winner
        })
      }
    }
  );
});

export { ticTacToeServer };