import { usePaginationQuery } from '@/shared/hook/useQueryParam'

export function useLimit() {
    const { limit, setPagination } = usePaginationQuery()
    return { limit, handleLimitChange: (limit: number) => setPagination({ page: 1, limit }) }
}
