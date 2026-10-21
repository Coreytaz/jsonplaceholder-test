import { Box, Heading, Text, Stack, LinkOverlay, LinkBox } from '@chakra-ui/react'
import NextLink from 'next/link'
import type { BlogsItem } from '../model/types'
import { Cover } from '@/shared/ui/Cover'

export function Card({ blog }: { blog: BlogsItem }) {
    return (
        <LinkBox
            as="article"
            transition="transform 0.2s"
            _hover={{ transform: 'translateY(-2px)' }}
            maxW="360px"
            w="full"
            bg={{ base: 'white', _dark: 'gray.700' }}
            boxShadow="2xl"
            rounded="md"
            p={6}
            overflow="hidden"
        >
            <Box bg="gray.100" mt={-6} mx={-6} mb={6}>
                <Cover src={blog.img} alt={blog.title} />
            </Box>
            <Stack>
                <Text
                    color="green.500"
                    textTransform="uppercase"
                    fontWeight={800}
                    fontSize="sm"
                    letterSpacing={1.1}
                >
                    Blog
                </Text>
                <Heading
                    color={{ base: 'gray.700', _dark: 'white' }}
                    fontSize="xl"
                    fontFamily="body"
                >
                    <LinkOverlay asChild>
                        <NextLink href={'/blog/' + blog.id}>{blog.title}</NextLink>
                    </LinkOverlay>
                </Heading>
            </Stack>
            <Stack mt={6} gap={0} fontSize="sm">
                <Text color="fg.muted">Author</Text>
                <Text fontWeight={600}>{blog.user?.name ?? 'Unknown author'}</Text>
            </Stack>
        </LinkBox>
    )
}
