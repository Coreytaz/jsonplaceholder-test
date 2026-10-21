import axios from 'axios'
import { makeAutoObservable, runInAction } from 'mobx'
import { getBlog } from '../api'
import type { BlogItem, RequestStatus } from '@/shared/api/types'

export class BlogStore {
    blog: BlogItem | null = null
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

    cancel() {
        this.requestId++
        this.controller?.abort()
    }

    async fetchBlog(id: number) {
        this.cancel()
        this.blog = null
        if (!Number.isSafeInteger(id) || id < 1) {
            this.status = 'not-found'
            return
        }
        const requestId = this.requestId
        const controller = new AbortController()
        this.controller = controller
        this.status = 'loading'
        try {
            const blog = await getBlog(id, controller.signal)
            if (controller.signal.aborted || requestId !== this.requestId) return
            runInAction(() => {
                this.blog = blog
                this.status = 'success'
            })
        } catch (error) {
            if (controller.signal.aborted || requestId !== this.requestId || axios.isCancel(error))
                return
            runInAction(() => {
                this.status =
                    axios.isAxiosError(error) &&
                    error.response?.status === 404 &&
                    error.config?.url === '/posts/' + id
                        ? 'not-found'
                        : 'error'
            })
        }
    }
}
