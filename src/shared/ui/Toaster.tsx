import { createToaster, Portal, Stack, Toast, Toaster as ChakraToaster } from '@chakra-ui/react'

export const toaster = createToaster({ placement: 'bottom-end', pauseOnPageIdle: true })

export function Toaster() {
    return (
        <Portal>
            <ChakraToaster toaster={toaster} insetInline={{ base: '4', md: '8' }}>
                {(toast) => (
                    <Toast.Root width={{ md: 'sm' }}>
                        <Toast.Indicator />
                        <Stack gap="1" flex="1">
                            {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
                            {toast.description && (
                                <Toast.Description>{toast.description}</Toast.Description>
                            )}
                        </Stack>
                        <Toast.CloseTrigger />
                    </Toast.Root>
                )}
            </ChakraToaster>
        </Portal>
    )
}
