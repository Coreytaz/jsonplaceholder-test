import { Flex, Skeleton } from '@chakra-ui/react'

export function SkeletonBlogs() {
    return (
        <Flex mt="5" gap="5" justifyContent="center" flexWrap="wrap" aria-label="Loading posts">
            {Array.from({ length: 6 }, (_, i) => (
                <Skeleton rounded="md" key={i} h={575} w="full" maxW={360} />
            ))}
        </Flex>
    )
}
