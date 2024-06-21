import './globals.css'

export const metadata = {
    title: 'IRC',
    description: 'HELLO THIS IS MY IRC',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
