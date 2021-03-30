const express = require('express');
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static('content'))

io.on('connection', (socket) => {
    console.log("connected")
    socket.on('drawing', msg => {
        console.log(msg)
        io.emit('drawing', msg);
    });
});

http.listen(port, () => {
    console.log(`server running at http://localhost:${port}/`);
});