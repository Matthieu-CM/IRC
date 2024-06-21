'use client'

import { useState } from 'react';
import logged from '../../vars/connected'
import { Navigate } from 'react-router-dom';

export default function Log() {
    const [input, setInput] = useState('')

    function submit(arg) {
        arg.preventDefault()
        if (input.length < 1) return
        logged.setName(input)
        logged.true()
        window.localStorage.setItem('user', input)
        setInput('')
    }
    if (logged.state === true) return <Navigate to="/" replace />

    return (<div id='LOG'>
        <h1>Login</h1>
        <form onSubmit={(e) => { submit(e) }}>
            <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
            />
            <input type="submit" value='Login' />
        </form>
    </div>)
}