import { cn } from "@/lib/utils"

interface ArrowDiagonalProps {
    className?: string
}

export default ({className} : ArrowDiagonalProps) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cn("size-6", className)}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
        </svg>

    )
}