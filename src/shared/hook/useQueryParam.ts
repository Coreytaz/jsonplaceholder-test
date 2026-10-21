import { useRouter } from 'next/router'

export function parsePagination(query: Record<string, string | string[] | undefined>) {
    const rawPage = query.page
    const page = typeof rawPage === 'string' && /^\d+$/.test(rawPage) ? Number(rawPage) : 1
    const rawLimit = query.limit
    const limit =
        typeof rawLimit === 'string' && ['5', '10', '20'].includes(rawLimit) ? Number(rawLimit) : 10
    return { page: Number.isSafeInteger(page) && page > 0 ? page : 1, limit }
}

export function usePaginationQuery() {
    const router = useRouter()
    const { page, limit } = parsePagination(router.query)
    const setPagination = (next: { page: number; limit: number }, replace = false) => {
        const url = {
            pathname: router.pathname,
            query: {
                ...router.query,
                page: String(next.page),
                limit: String(next.limit),
            },
        }
        return replace
            ? router.replace(url, undefined, { shallow: true })
            : router.push(url, undefined, { shallow: true })
    }
    return { page, limit, ready: router.isReady, setPagination }
}
