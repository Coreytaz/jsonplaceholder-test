import { Card, useBlogsStore } from '@/entities/Card'
import { Flex } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { parsePagination } from '@/shared/hook/useQueryParam'
import { SkeletonBlogs } from './SkeletonBlogs'
import { ErrorBlogs } from './ErrorBlogs'
import { NotFound } from './NotFound'

export const Blogs = observer(function Blogs() {
    const store = useBlogsStore()
    const router = useRouter()
    const { page, limit } = parsePagination(router.query)
    const ready = router.isReady

    useEffect(() => {
        if (!ready) return
        void store.fetchBlogs(limit, page)
        return () => store.cancel()
    }, [ready, page, limit, store])

    useEffect(() => {
        if (!ready) return
        const correctedPage = store.status === 'success' ? Math.min(page, store.totalPage) : page
        const invalid =
            (router.query.page !== undefined && router.query.page !== String(correctedPage)) ||
            (router.query.limit !== undefined && router.query.limit !== String(limit))
        if (invalid || correctedPage !== page) {
            void router.replace(
                {
                    pathname: router.pathname,
                    query: {
                        ...router.query,
                        page: String(correctedPage),
                        limit: String(limit),
                    },
                },
                undefined,
                { shallow: true }
            )
        }
    }, [ready, page, limit, store.status, store.totalPage, router])

    if (store.status === 'error') return <ErrorBlogs />
    if (store.status === 'init' || store.status === 'loading') return <SkeletonBlogs />
    return (
        <Flex mt="5" gap="5" justifyContent="center" flexWrap="wrap">
            {store.blogs.length ? (
                store.blogs.map((blog) => <Card key={blog.id} blog={blog} />)
            ) : (
                <NotFound />
            )}
        </Flex>
    )
})
