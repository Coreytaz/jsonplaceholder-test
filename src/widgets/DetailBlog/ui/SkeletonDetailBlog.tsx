import { Box, SkeletonText, Skeleton, Stack } from '@chakra-ui/react'

export function SkeletonDetailBlog() {
    return (
        <Box aria-label="Loading post">
            <SkeletonText mt="5" />
            <Stack mt="5" direction={{ base: 'column', md: 'row' }} gap="8">
                <Skeleton w="full" maxW={460} aspectRatio="1" />
                <Box flex="1">
                    <SkeletonText />
                </Box>
            </Stack>
        </Box>
    )
}
