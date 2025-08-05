import {config} from "dotenv"
import { app } from "./app"
import { Server } from "socket.io"
import { createServer } from "http"

config()

const httpServer = createServer(app)
const io = new Server(httpServer,{
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"], 
    },
})

io.on("connection",(socket)=>{
    console.log("connected")

    socket.on("hello",(msg)=>{
        console.log("message", msg)
    })
})

httpServer.listen(3000)

app.listen(()=>{
    console.log(`Server running at ${process.env.PORT || 3002}`)
})