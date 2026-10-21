import {
    Box,
    Flex,
    IconButton,
    Stack,
    Text,
    Container,
    Link,
    ClientOnly,
    Skeleton,
} from '@chakra-ui/react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { CreateBlog } from '../CreateBlog'
import NextLink from 'next/link'

export function Header() {
    const { resolvedTheme, setTheme } = useTheme()
    return (
        <Box bg={{ base: 'gray.200', _dark: 'gray.700' }} px={4}>
            <Container maxW="6xl">
                <Flex h={16} alignItems="center" justifyContent="space-between" gap={3}>
                    <Link asChild>
                        <NextLink href="/">
                            <Text
                                bgGradient="to-l"
                                gradientFrom="#7928CA"
                                gradientTo="#FF0080"
                                bgClip="text"
                                fontSize="2xl"
                                fontWeight="extrabold"
                            >
                                jsonplaceholder-test
                            </Text>
                        </NextLink>
                    </Link>
                    <Stack direction="row" gap={{ base: 3, md: 7 }}>
                        <CreateBlog />
                        <ClientOnly fallback={<Skeleton boxSize="10" />}>
                            <IconButton
                                aria-label="Toggle color mode"
                                onClick={() =>
                                    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
                                }
                            >
                                {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
                            </IconButton>
                        </ClientOnly>
                    </Stack>
                </Flex>
            </Container>
        </Box>
    )
}
