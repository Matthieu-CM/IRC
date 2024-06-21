import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import Command from './slashFunctions.js'
import db from './db.js'

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    io.on('connection', client => {
        client.user = ''
        client.on('channelAsk', data => {
            if (data.length < 1) return
            client.user = data
            db.users.push(client.user)
            db.channels['main'].users.push(client.user)
            let toSend = []
            for (var key in db.channels) if (db.channels[key].users.includes(client.user)) toSend.push(key)
            client.emit('Channels', toSend)
        });
        client.on('disconnect', () => { db.users = db.users.splice(db.users.indexOf(client.user), 1); })
        client.on('getChannel', data => { client.emit('channelMessages', { channel: data, messages: db.channels[data].messages }) })
        client.on('msg', data => {
            if (data.content.startsWith('/')) Command.hub(client, data,  io)
            else {
                db.channels[data.channel].messages.push({ user: client.user, content: data.content })
                client.emit('channelMessages', { channel: data.channel, messages: db.channels[data.channel].messages })
                for (let s of io.of('/').sockets) {
                    let socket = s[1];
                    console.log(socket['user'])
                    if (db.channels[data.channel].users.includes(socket['user'])) {
                        socket.emit('channelMessages', { channel: data.channel, messages: db.channels[data.channel].messages })
                    }
                }
            }
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});