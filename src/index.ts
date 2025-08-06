import {config} from "dotenv"
import { app } from "./app"
import { Server } from "socket.io"
import { ticTacToeServer } from "./sockets/ticTacToe"


config()

ticTacToeServer.listen(3000)

app.listen(()=>{
    console.log(`Server running at ${process.env.PORT || 3002}`)
})