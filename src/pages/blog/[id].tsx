import { DetailBlog, StoreBlogProvider, BlogStore } from '@/widgets/DetailBlog'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Page() {
    const [store] = useState(() => new BlogStore())
    const router = useRouter()
    return (
        <main>
            <Button
                variant="ghost"
                fontWeight={800}
                color="green.500"
                onClick={() => (window.history.length > 1 ? router.back() : router.push('/'))}
            >
                <ArrowLeft size={18} />
                Back
            </Button>
            <StoreBlogProvider store={store}>
                <DetailBlog />
            </StoreBlogProvider>
        </main>
    )
}
