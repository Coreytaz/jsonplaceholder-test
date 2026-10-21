import { afterEach, describe, expect, it } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { api } from '@/shared/api'
import { createPost, getPost, getPosts } from '@/shared/api/posts'

const mock = new MockAdapter(api)
const post = { id: 1, userId: 2, title: 'Title', body: 'Body' }
const user = { id: 2, name: 'Author', username: 'author' }
afterEach(() => mock.reset())

describe('posts API', () => {
    it('paginates, joins authors, and reads total without fetching all posts', async () => {
        mock.onGet('/posts', { params: { _limit: 5, _page: 2 } }).reply(200, [post], {
            'x-total-count': '100',
        })
        mock.onGet('/users').reply(200, [user])
        const result = await getPosts(5, 2)
        expect(result.total).toBe(100)
        expect(result.blogs[0]).toMatchObject({
            ...post,
            user,
            img: expect.stringContaining('random=1'),
        })
        expect(mock.history.get).toHaveLength(2)
    })
    it.each([undefined, '', 'invalid', '-1', '1.5'])(
        'falls back to counting posts for header %s',
        async (header) => {
            mock.onGet('/posts', { params: { _limit: 10, _page: 1 } }).reply(200, [post], {
                'x-total-count': header,
            })
            mock.onGet('/posts').reply(200, [post, { ...post, id: 2 }])
            mock.onGet('/users').reply(200, [user])
            expect((await getPosts(10, 1)).total).toBe(2)
        }
    )
    it('allows a missing author without dropping a post', async () => {
        mock.onGet('/posts').reply(200, [post], { 'x-total-count': '1' })
        mock.onGet('/users').reply(200, [])
        expect((await getPosts(10, 1)).blogs[0].user).toBeUndefined()
    })
    it('gets the correct author for the detail post', async () => {
        mock.onGet('/posts/1').reply(200, post)
        mock.onGet('/users/2').reply(200, user)
        expect(await getPost(1)).toMatchObject({ ...post, user })
    })
    it('does not request an author when the post does not exist', async () => {
        mock.onGet('/posts/1').reply(404)
        await expect(getPost(1)).rejects.toMatchObject({ response: { status: 404 } })
        expect(mock.history.get).toHaveLength(1)
    })
    it('sends flat JSON and returns the created fields', async () => {
        const input = { title: 'Title', body: 'Body', userId: 1 }
        mock.onPost('/posts').reply((config) => {
            expect(JSON.parse(config.data)).toEqual(input)
            expect(config.headers?.['Content-Type']).toBe('application/json')
            return [201, { ...input, id: 101 }]
        })
        expect((await createPost(input)).data).toEqual({ ...input, id: 101 })
    })
    it('propagates failures and cancellation', async () => {
        mock.onGet('/posts').networkError()
        mock.onGet('/users').reply(200, [])
        await expect(getPosts(10, 1)).rejects.toThrow()
        const controller = new AbortController()
        controller.abort()
        await expect(getPosts(10, 1, controller.signal)).rejects.toMatchObject({
            code: 'ERR_CANCELED',
        })
    })
})
