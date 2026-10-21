import { usePaginationQuery } from '@/shared/hook/useQueryParam'

export function usePagination() {
    const { page, limit, setPagination } = usePaginationQuery()
    return { currentPage: page, handlePageChange: (page: number) => setPagination({ page, limit }) }
}
