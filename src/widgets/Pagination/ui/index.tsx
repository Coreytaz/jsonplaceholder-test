import { Flex, Text } from '@chakra-ui/react'
import { PaginationItem } from './PaginationItem'
import { usePagination } from '../params'
import { useBlogsStore } from '@/entities/Card'
import { observer } from 'mobx-react-lite'

export const Pagination = observer(function Pagination() {
    const store = useBlogsStore()
    const { currentPage, handlePageChange } = usePagination()
    if (store.status !== 'success' || !store.total || currentPage > store.totalPage) return null
    const pages = Array.from({ length: store.totalPage }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === store.totalPage || Math.abs(p - currentPage) <= 2
    )
    return (
        <Flex as="nav" aria-label="Pagination" mt="8" gap="2" flexWrap="wrap" justify="center">
            {pages.map((page, i) => (
                <Flex key={page} gap="2" align="center">
                    {i > 0 && page - pages[i - 1] > 1 && <Text aria-hidden="true">…</Text>}
                    <PaginationItem
                        page={page}
                        isCurrent={page === currentPage}
                        onPageChange={handlePageChange}
                    />
                </Flex>
            ))}
        </Flex>
    )
})
