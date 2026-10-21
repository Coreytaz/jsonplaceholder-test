import axios from 'axios'
import { makeAutoObservable, runInAction } from 'mobx'
import { getBlogs } from '../api'
import type { BlogItem, RequestStatus } from '@/shared/api/types'

export class BlogsStore {
    page = 1
    limit = 10
    total = 0
    blogs: BlogItem[] = []
    status: RequestStatus = 'init'
    private controller?: AbortController
    private requestId = 0

    constructor() {
        makeAutoObservable<this, 'controller' | 'requestId'>(
            this,
            {
                controller: false,
                requestId: false,
            },
            { autoBind: true }
        )
    }

    get totalPage() {
        return Math.max(1, Math.ceil(this.total / this.limit))
    }

    cancel() {
        this.requestId++
        this.controller?.abort()
    }

    async fetchBlogs(limit = this.limit, page = this.page) {
        this.cancel()
        const requestId = this.requestId
        const controller = new AbortController()
        this.controller = controller
        this.limit = limit
        this.page = page
        this.status = 'loading'
        try {
            const { blogs, total } = await getBlogs(limit, page, controller.signal)
            if (controller.signal.aborted || requestId !== this.requestId) return
            runInAction(() => {
                this.blogs = blogs
                this.total = total
                this.status = 'success'
            })
        } catch (error) {
            if (controller.signal.aborted || requestId !== this.requestId || axios.isCancel(error))
                return
            runInAction(() => {
                this.status = 'error'
            })
        }
    }
}
