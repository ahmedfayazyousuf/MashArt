import express from "express"
import http from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import colors from "colors"
import path from "path"
import { fileURLToPath } from "url"

import connectDB from "./config/db.js"
import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"
import chatMessageRoutes from "./routes/chatMessageRoutes.js"
import commentRoutes from "./routes/commentRoutes.js"
import playlistRoutes from "./routes/playlistRoutes.js"
import collabRoutes from "./routes/collabRoutes.js"
import { errorHandler, notFound } from "./middleware/errorMiddleware.js"

dotenv.config()

connectDB()

const app = express()
const server = http.createServer(app)

const io = new Server(server)

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    socket.name = data.username
    socket.join(data.roomCode)
    socket.to(data.roomCode).emit("get-users")
    socket.to(data.roomCode).emit("get-canvas")
  })

  socket.on("updated-canvas", (data) => {
    socket.to(data.roomCode).emit("update-canvas", data.imageData)
  })

  socket.on("image-updated", (data) => {
    io.in(data.roomCode).emit("get-image", data.image)
  })

  socket.on("drawing", (data) => socket.to(data.roomCode).emit("drawing", data))

  socket.on("leave-room", (data) => {
    socket.to(data.roomCode).emit("get-users")
  })

  socket.on("remove-all", (data) => {
    socket.to(data.roomCode).emit("remove-from-room")
  })

  socket.on("send-message", (data) => {
    socket.to(data.roomCode).emit("receive-message", {
      username: data.username,
      message: data.message,
    })
  })
})

app.use(express.json())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use("/backend/uploads/", express.static(path.join(__dirname, "uploads")))

app.use("/api/user", userRoutes)
app.use("/api/post", postRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/message", chatMessageRoutes)
app.use("/api/comment", commentRoutes)
app.use("/api/playlist", playlistRoutes)
app.use("/api/collab", collabRoutes)

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build/")))

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  )
} else {
  app.get("/", (req, res) => {
    res.send("API is running...")
  })
}

app.use(notFound)

app.use(errorHandler)

const PORT = process.env.PORT || 5000

server.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  )
)
