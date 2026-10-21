import { Heading, Box, Text, Stack } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useBlogStore } from '../model'
import { useRouter } from 'next/router'
import { BlogAuthor } from '@/widgets/BlogAuthor'
import { SkeletonDetailBlog } from './SkeletonDetailBlog'
import { RequestError } from '@/shared/ui/RequestError'
import { Cover } from '@/shared/ui/Cover'
import Head from 'next/head'

export const DetailBlog = observer(function DetailBlog() {
    const router = useRouter()
    const store = useBlogStore()
    const rawId = router.query.id
    const id = typeof rawId === 'string' && /^\d+$/.test(rawId) ? Number(rawId) : NaN
    const ready = router.isReady
    useEffect(() => {
        if (!ready) return
        void store.fetchBlog(id)
        return () => store.cancel()
    }, [ready, id, store])

    if (store.status === 'not-found') return <RequestError notFound />
    if (store.status === 'error') return <RequestError onRetry={() => void store.fetchBlog(id)} />
    if (store.status !== 'success' || !store.blog) return <SkeletonDetailBlog />
    return (
        <>
            <Head>
                <title>{store.blog.title}</title>
            </Head>
            <Heading
                mt="5"
                color="green.500"
                as="h1"
                fontSize={{ base: 'xl', md: '3xl' }}
                textTransform="uppercase"
                fontWeight={800}
                letterSpacing={1.1}
            >
                {store.blog.title}
            </Heading>
            <Stack mt="5" direction={{ base: 'column', md: 'row' }} gap="8" align="center">
                <Box flex="1" w="full" position="relative" p="5">
                    <Box
                        position="absolute"
                        inset="0"
                        opacity="0.4"
                        backgroundSize="20px 20px"
                        backgroundImage="radial-gradient(#dd6b20 1px, transparent 1px)"
                    />
                    <Cover
                        position="relative"
                        rounded="lg"
                        src={store.blog.img}
                        alt={store.blog.title}
                    />
                </Box>
                <Box flex="1" w="full">
                    <Text
                        fontSize="lg"
                        color={{ base: 'gray.700', _dark: 'gray.200' }}
                        whiteSpace="pre-line"
                    >
                        {store.blog.body}
                    </Text>
                    <BlogAuthor />
                </Box>
            </Stack>
        </>
    )
})
