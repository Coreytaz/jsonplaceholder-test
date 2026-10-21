import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { BlogsStore } from '@/entities/Card/model/model'
import { BlogStore } from '@/widgets/DetailBlog/model/model'
import { getPosts, getPost } from '@/shared/api/posts'

vi.mock('@/shared/api/posts', () => ({ getPosts: vi.fn(), getPost: vi.fn() }))
const post = { id: 1, userId: 1, title: 'Title', body: 'Body', img: 'cover' }
function deferred<T>() {
    let resolve!: (value: T) => void
    let reject!: (error: Error) => void
    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })
    return { promise, resolve, reject }
}
beforeEach(() => vi.resetAllMocks())

describe('BlogsStore', () => {
    it('loads data, calculates pages, exposes errors and retries', async () => {
        const store = new BlogsStore()
        vi.mocked(getPosts)
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValueOnce({ blogs: [post], total: 21 })
        await store.fetchBlogs(10, 1)
        expect(store.status).toBe('error')
        await store.fetchBlogs()
        expect(store.status).toBe('success')
        expect(store.totalPage).toBe(3)
        expect(store.blogs[0].id).toBe(1)
    })
    it('cancels earlier requests and ignores their late responses', async () => {
        const first = deferred<{ blogs: (typeof post)[]; total: number }>()
        const second = deferred<{ blogs: (typeof post)[]; total: number }>()
        vi.mocked(getPosts).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
        const store = new BlogsStore()
        const oldRequest = store.fetchBlogs(10, 1)
        const signal = vi.mocked(getPosts).mock.calls[0][2]
        const newRequest = store.fetchBlogs(5, 2)
        expect(signal?.aborted).toBe(true)
        second.resolve({ blogs: [{ ...post, id: 6 }], total: 100 })
        await newRequest
        first.resolve({ blogs: [post], total: 1 })
        await oldRequest
        expect(store.blogs[0].id).toBe(6)
        expect(store.page).toBe(2)
        expect(store.total).toBe(100)
    })
    it('ignores errors after disposal and keeps instances independent', async () => {
        const pending = deferred<{ blogs: (typeof post)[]; total: number }>()
        vi.mocked(getPosts).mockReturnValue(pending.promise)
        const store = new BlogsStore()
        const task = store.fetchBlogs(5, 2)
        store.cancel()
        pending.reject(new Error('late failure'))
        await task
        expect(store.status).toBe('loading')
        expect(new BlogsStore().page).toBe(1)
    })
})

describe('BlogStore', () => {
    it.each([NaN, -1, 0, 1.5, Infinity])('rejects invalid id %s before HTTP', async (id) => {
        const store = new BlogStore()
        await store.fetchBlog(id)
        expect(store.status).toBe('not-found')
        expect(getPost).not.toHaveBeenCalled()
    })
    it('distinguishes a missing post, a missing author, and a network error', async () => {
        const notFound = (url: string) => {
            const config = { url, headers: new AxiosHeaders() }
            return new AxiosError('404', 'ERR_BAD_REQUEST', config, undefined, {
                status: 404,
                statusText: 'Not Found',
                data: {},
                headers: {},
                config,
            })
        }
        vi.mocked(getPost)
            .mockRejectedValueOnce(notFound('/posts/1'))
            .mockRejectedValueOnce(notFound('/users/1'))
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValueOnce(post)
        const store = new BlogStore()
        await store.fetchBlog(1)
        expect(store.status).toBe('not-found')
        await store.fetchBlog(1)
        expect(store.status).toBe('error')
        await store.fetchBlog(1)
        expect(store.status).toBe('error')
        await store.fetchBlog(1)
        expect(store.status).toBe('success')
    })
    it('does not overwrite a new post with a late response', async () => {
        const first = deferred<typeof post>()
        vi.mocked(getPost)
            .mockReturnValueOnce(first.promise)
            .mockResolvedValueOnce({ ...post, id: 2 })
        const store = new BlogStore()
        const old = store.fetchBlog(1)
        const signal = vi.mocked(getPost).mock.calls[0][1]
        await store.fetchBlog(2)
        expect(signal?.aborted).toBe(true)
        first.resolve(post)
        await old
        expect(store.blog?.id).toBe(2)
        store.cancel()
    })
})
