import db from './db.js'

class functions {
    constructor() { }
    hub(client, data, io) {
        this.io = io
        if (data.content.startsWith('/nick')) this.nick(client, data, db)
        else if (data.content.includes('/list')) this.list(client, data, db)
        else if (data.content.startsWith('/create ')) this.create(client, data, db)
        else if (data.content.startsWith('/delete ')) this.delete(client, data, db)
        else if (data.content.startsWith('/msg ')) this.msg(client, data, db)
        else if (data.content.startsWith('/join ')) this.join(client, data, db)
        else if (data.content.startsWith('/leave ')) this.leave(client, data, db)
        else if (data.content.startsWith('/users')) this.users(client, data, db)
    }
    nick(client, data, db) {
        if (data.content.length < 6) return
        let old = client.user
        const index = db.users.indexOf(client.user);
        db.users = db.users.splice(index, 1);
        client.user = data.content.replace('/nick ', '')
        db.users.push(client.user)
        for (let s of db.channels) {
            if (s.user.includes(old)) {
                db.channels[db.channels.indexOf(s)].user.push(client.user)
                let index = s.indexOf(client.user);
                s = s.splice(index, 1);
            }
        }
        this.globalMessage(old + ' is now ' + client.user, db)
        client.emit('userNameChange', client.user)
    }
    list(client, data, db) {
        let str = data.content.replace('/list ', '').replace('/list', '')
        let keys = Object.keys(db.channels)
        let answer = ''
        keys.forEach(e => {
            if (e.includes(str)) {
                answer += e + ', '
            }
        })
        client.emit('alert', answer)
    }
    create(client, data, db) {
        let str = data.content.replace('/create ', '').replace('/create', '')
        if (str.length < 1) return
        db.channels[str] = { users: [client.user], messages: [], creator: client.user }

        this.refreshChannels(client, db)
        this.globalMessage(client.user + ' has created a new channel : ' + str, db)
    }
    delete(client, data, db) {
        let str = data.content.replace('/delete ', '').replace('/delete', '')
        if (str.length < 1) return
        if (db.channels[str]) { } else { return }
        if (db.channels[str].creator != client.user) return
        delete db.channels[str]

        this.refreshChannels(client, db)
        this.globalMessage(client.user + ' has deleted this channel : ' + str, db)
    }
    msg(client, data, db) {
        let user = data.content.split(' ')[1]
        let convo = null;
        Object.keys(db.channels).forEach(e => {
            if (e.includes(client.user) && e.includes(user)) convo = e
        })
        if (convo == null) {
            db.channels[client.user + ' - ' + user] = { users: [user, client.user], messages: [{ user: client.user, content: data.content.split(' ')[2] }], creator: client.user }
            for (let s of this.io.of('/').sockets) {
                let toSend = []
                for (var key in db.channels) if (db.channels[key].users.includes(s[1].user)) toSend.push(key)
                s[1].emit('Channels', toSend)
            }
        } else {
            db.channels[convo].messages.push({ user: client.user, content: msg })
            client.emit('channelMessages', { channel: e, messages: db.channels[e].messages })
            for (let s of this.io.of('/').sockets) if (db.channels[e].users.includes(s[1]['user'])) s[1].emit('channelMessages', { channel: e, messages: db.channels[e].messages })
        }
    }

    join(client, data, db) {
        db.channels[data.content.split(' ')[1]].users.push(client.user)
        this.refreshChannels(client, db)
    }

    leave(client, data, db) {
        const c = data.content.split(' ')
        const index = db.channels[c[1]].users.indexOf(client.user);
        if (index !== -1) db.channels[c[1]].users.splice(index, 1);
        this.refreshChannels(client, db)
    }

    users(client, data, db) {
        let c = data.channel
        let us = db.channels[c].users
        let result = ''
        Object.keys(us).forEach(e => {
            result += us[e] + ', '
        })
        client.emit('users', result)
    }

    globalMessage(arg, db) {
        Object.keys(db.channels).forEach(e => { db.channels[e].messages.push({ user: 'ANNONCE', content: arg }) })
        for (let s of this.io.of('/').sockets) { Object.keys(db.channels).forEach(e => { s[1].emit('channelMessages', { channel: e, messages: db.channels[e].messages }) }) }
    }

    refreshChannels(client, db) {
        let toSend = []
        for (var key in db.channels) {
            if (db.channels[key].users.includes(client.user)) {
                toSend.push(key)
            }
        }
        client.emit('Channels', toSend)
    }
}

export default new functions()