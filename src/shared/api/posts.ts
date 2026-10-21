import { api } from './axiosInstances'
import type { BlogItem, CreatePostInput, Post, User } from './types'

export const coverFor = (id: number) => 'https://loremflickr.com/1280/1280?random=' + id

export async function getPosts(limit: number, page: number, signal?: AbortSignal) {
    const [posts, users] = await Promise.all([
        api.get<Post[]>('/posts', { params: { _limit: limit, _page: page }, signal }),
        api.get<User[]>('/users', { signal }),
    ])
    const countHeader = posts.headers['x-total-count']
    let total = Number(countHeader)
    if (countHeader == null || countHeader === '' || !Number.isSafeInteger(total) || total < 0) {
        total = (await api.get<Post[]>('/posts', { signal })).data.length
    }
    const blogs: BlogItem[] = posts.data.map((post) => ({
        ...post,
        user: users.data.find((user) => user.id === post.userId),
        img: coverFor(post.id),
    }))
    return { blogs, total }
}

export async function getPost(id: number, signal?: AbortSignal): Promise<BlogItem> {
    const { data: post } = await api.get<Post>('/posts/' + id, { signal })
    const { data: user } = await api.get<User>('/users/' + post.userId, { signal })
    return { ...post, user, img: coverFor(post.id) }
}

export function createPost(input: CreatePostInput) {
    return api.post<Post>('/posts', input)
}
