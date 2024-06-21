'use client'

import { useState } from "react";
import Channels from '../components/Channels'
import Chat from '../components/Chat'
import { socket } from './socket'

export default function Home() {
    const [username, setUsername] = useState('')
    const [actualChannel, setActualChannel] = useState('')
    if (username === '') {
        const u = prompt('What is your username ?')
        if (u !== null) setUsername(u)
    }

    return (
        <section>
            <Channels username={username} changeChannel={(e:string)=>{setActualChannel(e)}} />
            <Chat username={username} actualChannel={actualChannel}/>
        </section>
    );
}


