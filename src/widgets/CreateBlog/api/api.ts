import { createPost } from '@/shared/api/posts'
import type { CreatePostInput } from '@/shared/api/types'

export const createBlog = (input: Pick<CreatePostInput, 'title' | 'body'>) =>
    createPost({ ...input, userId: 1 })
