import { Image, type ImageProps } from '@chakra-ui/react'
import { useState } from 'react'

export function Cover({ src, alt, ...props }: ImageProps) {
    const [failedSource, setFailedSource] = useState<ImageProps['src']>()
    return (
        <Image
            {...props}
            src={failedSource === src ? '/cover-placeholder.svg' : src}
            alt={alt}
            onError={() => setFailedSource(src)}
            aspectRatio="1"
            objectFit="cover"
            width="full"
        />
    )
}
