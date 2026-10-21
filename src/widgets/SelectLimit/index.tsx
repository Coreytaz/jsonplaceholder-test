import { NativeSelect } from '@chakra-ui/react'
import { useLimit } from './params'

export function SelectLimit() {
    const { limit, handleLimitChange } = useLimit()
    return (
        <NativeSelect.Root mt="5" w={{ base: '100%', md: 'sm' }}>
            <NativeSelect.Field
                aria-label="Posts per page"
                value={limit}
                onChange={(e) => void handleLimitChange(Number(e.target.value))}
            >
                {[5, 10, 20].map((value) => (
                    <option key={value} value={value}>
                        Take {value}
                    </option>
                ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
        </NativeSelect.Root>
    )
}
