import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en" suppressHydrationWarning>
            <Head>
                <script
                    defer
                    src="https://stats.coreytaz.ru/tracker.js"
                    data-site-id="ac08bff7-5d96-4333-9e2b-ce712ce2030b"
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
