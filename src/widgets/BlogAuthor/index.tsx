import { HStack, Avatar, Tag, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { useBlogStore } from '../DetailBlog'

export const BlogAuthor = observer(function BlogAuthor() {
    const store = useBlogStore()
    const user = store.blog?.user
    return (
        <HStack mt="4" gap="2" flexWrap="wrap">
            <Avatar.Root>
                <Avatar.Fallback name={user?.name ?? 'Unknown author'} />
            </Avatar.Root>
            <Text fontWeight="medium">{user?.name ?? 'Unknown author'}</Text>
            {user && (
                <Tag.Root colorPalette="green" variant="solid">
                    <Tag.Label>{user.username}</Tag.Label>
                </Tag.Root>
            )}
        </HStack>
    )
})
