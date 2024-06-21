'use client'

import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import logged from './vars/connected'
import { useRouter } from 'next/navigation'

export default function Home() {
    const [username, setUsername] = useState('')
    const [input, setInput] = useState('')
    const [channels, setChannels] = useState([])
    const [actualChannel, setActualChannel] = useState('')
    const [messages, setMessages] = useState([])


    useEffect(() => {
        setUsername(logged.name)

        socket.emit('channelAsk', logged.name)
        socket.on('Channels', data => { setChannels(data) })
        socket.on('userNameChange', data => { setUsername(data) })
        socket.on('alert', data => { alert(data) })
        socket.on('users', result => { alert(result) })
        socket.on('channelMessages', data => {
            let sel = document.querySelector('.selected')
            if (sel!=null && data.channel === sel.innerHTML) setMessages(data.messages)
            })
    }, [])

    const router = useRouter()
    
    if (logged.state === false) {
        router.push('/log')
    }
    
    function submit(arg: any, msg = input, channel = actualChannel) {
        if (arg === null) { } else { arg.preventDefault() }
        if (channel === '' || msg === '') return
        socket.emit('msg', { content: msg, user: username, channel: channel })
        setInput('')
    }

    function changeChannel(arg: string) { setActualChannel(arg); socket.emit('getChannel', arg) }

    return (
        <section id='IRC'>
            <div id='channels'>
                {channels.map((e, key) =>
                    <button
                        onClick={(c) => {
                            if (c.target instanceof Element) {
                                if (c.target.classList.contains('selected')) { return }
                                let sel = document.querySelector('.selected')
                                if (sel !== null) { sel.classList.remove('selected') }
                                c.target.classList.add('selected')
                                changeChannel(e)
                            }
                        }}
                        key={key}>
                        {e}
                    </button>
                )}
                <button id='create' onClick={() => {
                    let newChannel = prompt('What will be the name of the new channel')
                    submit(null, '/create ' + newChannel, 'main')
                }}>Create</button>
            </div>
            <main>
                <div id='display'>
                    {messages.map((e: Messages, key) =>
                        <div className='message' key={key}>
                            {e.user === 'ANNONCE' ?
                                <p className='ANNONCE'>{e.content}</p>
                                :
                                <>
                                    <p className='user'>{e.user}</p>
                                    <p>{e.content}</p>
                                </>
                            }
                        </div>
                    )}
                </div>
                <form onSubmit={e => { submit(e) }}>
                    <input type="text" value={input} onChange={e => { setInput(e.target.value) }} placeholder={username} />
                    <input type="submit" value='Send !' />
                    <details id='fastCommands'>
                        <summary>Commands</summary>
                        <div id="detailsButtonsDiv">
                            <button onClick={() => { submit(null, '/list', 'main') }}>List</button>
                            <button onClick={() => { submit(null, '/nick ' + prompt('What will be your new name ?'), 'main') }}>Nick</button>
                            <button onClick={() => { submit(null, '/create ' + prompt('What will be the name of the new channel'), 'main') }}>Create</button>
                            <button onClick={() => { submit(null, '/delete ' + prompt('What will be the deleted Channel ?'), 'main') }}>Delete</button>
                            <button onClick={() => { submit(null, '/join ' + prompt('What channel will you join'), 'main') }}>Join</button>
                            <button onClick={() => { submit(null, '/leave ' + prompt('What channel will you leave ?'), 'main') }}>Leave</button>
                            <button onClick={() => { submit(null, '/msg ' + prompt('Who will receve a message ?') + ' ' + prompt('what is the message ?'), 'main') }}>Msg</button>
                            <button onClick={() => {
                                if (actualChannel === '') {
                                    submit(null, '/users', '' + prompt('On what channel would you see the connected users ?'))
                                } else { submit(null, '/users', actualChannel) }
                            }}>Users</button>
                        </div>
                    </details>
                </form>
            </main>
        </section >
    )
}

interface Messages {
    user: string,
    content: string,
}