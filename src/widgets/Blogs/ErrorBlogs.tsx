import { useBlogsStore } from '@/entities/Card'
import { RequestError } from '@/shared/ui/RequestError'

export function ErrorBlogs() {
    const store = useBlogsStore()
    return <RequestError onRetry={() => void store.fetchBlogs()} />
}
