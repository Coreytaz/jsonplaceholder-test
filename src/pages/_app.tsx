import { Header } from '@/widgets/Header'
import { Provider } from '@/shared/ui/Provider'
import { Toaster } from '@/shared/ui/Toaster'
import { Container } from '@chakra-ui/react'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Provider>
            <Header />
            <Container maxW="6xl" pt="5">
                <Component {...pageProps} />
            </Container>
            <Toaster />
        </Provider>
    )
}
