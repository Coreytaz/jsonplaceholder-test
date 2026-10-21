import { Plus } from 'lucide-react'
import { Button, Dialog, Field, IconButton, Input, Portal, Text, Textarea } from '@chakra-ui/react'
import { useRef, useState, type FormEvent } from 'react'
import { createBlog } from './api'
import { toaster } from '@/shared/ui/Toaster'

export function CreateBlog() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [pending, setPending] = useState(false)
    const submitting = useRef(false)
    const reset = () => {
        setTitle('')
        setBody('')
        setSubmitted(false)
    }
    const changeOpen = (value: boolean) => {
        if (submitting.current) return
        setOpen(value)
        if (!value) reset()
    }
    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (submitting.current) return
        setSubmitted(true)
        if (!title.trim() || !body.trim()) return
        submitting.current = true
        setPending(true)
        try {
            const { data } = await createBlog({ title: title.trim(), body: body.trim() })
            console.info('JSONPlaceholder simulated creation:', data)
            toaster.create({
                title: 'Blog creation simulated',
                description: 'JSONPlaceholder returned the post but does not save it.',
                type: 'success',
            })
            setOpen(false)
            reset()
        } catch {
            toaster.create({
                title: 'Unable to create blog',
                description: 'Please try again.',
                type: 'error',
            })
        } finally {
            submitting.current = false
            setPending(false)
        }
    }
    return (
        <Dialog.Root
            open={open}
            onOpenChange={({ open }) => changeOpen(open)}
            closeOnEscape={!pending}
            closeOnInteractOutside={!pending}
        >
            <Dialog.Trigger asChild>
                <IconButton aria-label="Create blog">
                    <Plus />
                </IconButton>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content mx="4">
                        <form onSubmit={onSubmit} noValidate>
                            <Dialog.Header>
                                <Dialog.Title>Create new Blog</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text mb="4" color="fg.muted">
                                    Creation is simulated. JSONPlaceholder does not save new posts.
                                </Text>
                                <Field.Root invalid={submitted && !title.trim()} required>
                                    <Field.Label>
                                        Blog title
                                        <Field.RequiredIndicator />
                                    </Field.Label>
                                    <Input
                                        placeholder="Blog title"
                                        value={title}
                                        disabled={pending}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                    <Field.ErrorText>The field cannot be empty</Field.ErrorText>
                                </Field.Root>
                                <Field.Root mt="4" invalid={submitted && !body.trim()} required>
                                    <Field.Label>
                                        Text blog
                                        <Field.RequiredIndicator />
                                    </Field.Label>
                                    <Textarea
                                        placeholder="Text blog"
                                        value={body}
                                        disabled={pending}
                                        onChange={(e) => setBody(e.target.value)}
                                    />
                                    <Field.ErrorText>The field cannot be empty</Field.ErrorText>
                                </Field.Root>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button
                                    variant="outline"
                                    onClick={() => changeOpen(false)}
                                    disabled={pending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    colorPalette="blue"
                                    type="submit"
                                    loading={pending}
                                    disabled={pending}
                                >
                                    Create
                                </Button>
                            </Dialog.Footer>
                        </form>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
