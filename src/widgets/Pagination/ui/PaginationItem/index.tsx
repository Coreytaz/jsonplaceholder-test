import { Button } from '@chakra-ui/react'

interface PaginationItemProps {
    isCurrent?: boolean
    page: number
    onPageChange: (page: number) => void
}

export function PaginationItem({ isCurrent = false, page, onPageChange }: PaginationItemProps) {
    return (
        <Button
            size="sm"
            fontSize="xs"
            minW="8"
            aria-label={'Page ' + page}
            aria-current={isCurrent ? 'page' : undefined}
            disabled={isCurrent}
            bg={isCurrent ? 'green.500' : { base: 'gray.200', _dark: 'gray.600' }}
            color={isCurrent ? 'white' : undefined}
            onClick={() => onPageChange(page)}
        >
            {page}
        </Button>
    )
}
