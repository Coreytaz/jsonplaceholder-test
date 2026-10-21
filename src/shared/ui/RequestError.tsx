import { Box, Button, Heading, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

export function RequestError({
    notFound = false,
    onRetry,
}: {
    notFound?: boolean
    onRetry?: () => void
}) {
    return (
        <Box textAlign="center" py={10} px={6} role={notFound ? undefined : 'alert'}>
            <Heading as="h1" color="green.500">
                {notFound ? '404' : 'Unable to load data'}
            </Heading>
            <Text my={4}>
                {notFound ? 'Page Not Found' : 'Check your connection and try again.'}
            </Text>
            {onRetry && (
                <Button colorPalette="green" onClick={onRetry}>
                    Try again
                </Button>
            )}
            {notFound && (
                <Button asChild colorPalette="green">
                    <NextLink href="/">Go to Home</NextLink>
                </Button>
            )}
        </Box>
    )
}
