export interface Post {
    userId: number
    id: number
    title: string
    body: string
}

export interface User {
    id: number
    name: string
    username: string
    email: string
    address: {
        street: string
        suite: string
        city: string
        zipcode: string
        geo: { lat: string; lng: string }
    }
    phone: string
    website: string
    company: { name: string; catchPhrase: string; bs: string }
}

export interface BlogItem extends Post {
    user?: User
    img: string
}

export type CreatePostInput = Pick<Post, 'title' | 'body' | 'userId'>
export type RequestStatus = 'init' | 'loading' | 'success' | 'error' | 'not-found'
