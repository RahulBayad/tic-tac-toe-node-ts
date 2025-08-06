import { Server } from "socket.io"
import { app } from "../app"
import { createServer } from "http"

const ticTacToeServer = createServer(app)
const io = new Server(ticTacToeServer,{
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"], 
    },
})

io.on("connection",(socket)=>{
    console.log("connected", socket.id)

    socket.on("hello",(msg)=>{
        console.log("message", msg)
    })
    socket.on("disconnect",()=>{
        console.log("disconnected")
    })
})

export {ticTacToeServer}
