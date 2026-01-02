import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import PageLayout from '@/components/ui/PageLayout'

// Mock dependencies
vi.mock('@tanstack/react-router', () => ({
    Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
        <a href={to} {...props}>{children}</a>
    ),
}))

vi.mock('./DrawerMenu', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="nav-drawer">{children}</div>,
}))

vi.mock('@/components/ui/Dialog', () => ({
    default: ({ children, title }: { children: React.ReactNode; title?: string }) => (
        <div data-testid="dialog" data-title={title}>{children}</div>
    ),
}))

vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, ...props }: { children?: React.ReactNode; className?: string }) => (
            <div {...props}>{children}</div>
        ),
    },
}))

describe('PageLayout', () => {
    // ============================================
    // Rendering Tests
    // ============================================
    describe('Rendering', () => {
        it('renders without crashing', () => {
            render(<PageLayout />)
            expect(screen.getByRole('link', { name: /go to home page/i })).toBeInTheDocument()
        })

        it('renders the logo image', () => {
            render(<PageLayout />)
            expect(screen.getByAltText('Logo')).toBeInTheDocument()
        })

        it('renders background texture', () => {
            render(<PageLayout />)
            expect(screen.getByAltText('Background Texture')).toBeInTheDocument()
        })

        it('renders NavDrawer wrapper', () => {
            render(<PageLayout />)
            expect(screen.getByTestId('nav-drawer')).toBeInTheDocument()
        })
    })

    // ============================================
    // Slot Composition Tests
    // ============================================
    describe('Slot Composition', () => {
        it('renders upperSlot content', () => {
            render(
                <PageLayout upperSlot={<div data-testid="upper-content">Upper Content</div>} />
            )
            expect(screen.getByTestId('upper-content')).toBeInTheDocument()
            expect(screen.getByText('Upper Content')).toBeInTheDocument()
        })

        it('renders middleLeftSlot content', () => {
            render(
                <PageLayout middleLeftSlot={<div data-testid="middle-left">Middle Left</div>} />
            )
            expect(screen.getByTestId('middle-left')).toBeInTheDocument()
        })

        it('renders middleRightSlot content', () => {
            render(
                <PageLayout middleRightSlot={<div data-testid="middle-right">Middle Right</div>} />
            )
            expect(screen.getByTestId('middle-right')).toBeInTheDocument()
        })

        it('renders bottomUpper content', () => {
            render(
                <PageLayout bottomUpper={<div data-testid="bottom-upper">Bottom Upper</div>} />
            )
            expect(screen.getByTestId('bottom-upper')).toBeInTheDocument()
        })

        it('renders bottomBottom content', () => {
            render(
                <PageLayout bottomBottom={<div data-testid="bottom-bottom">Bottom Bottom</div>} />
            )
            expect(screen.getByTestId('bottom-bottom')).toBeInTheDocument()
        })

        it('renders all slots simultaneously', () => {
            render(
                <PageLayout
                    upperSlot={<span>Upper</span>}
                    middleLeftSlot={<span>Middle Left</span>}
                    middleRightSlot={<span>Middle Right</span>}
                    bottomUpper={<span>Bottom Upper</span>}
                    bottomBottom={<span>Bottom Bottom</span>}
                />
            )
            expect(screen.getByText('Upper')).toBeInTheDocument()
            expect(screen.getByText('Middle Left')).toBeInTheDocument()
            expect(screen.getByText('Middle Right')).toBeInTheDocument()
            expect(screen.getByText('Bottom Upper')).toBeInTheDocument()
            expect(screen.getByText('Bottom Bottom')).toBeInTheDocument()
        })

        it('handles empty slots gracefully', () => {
            render(<PageLayout />)
            // Should render without errors even with no slot content
            expect(screen.getByTestId('nav-drawer')).toBeInTheDocument()
        })
    })

    // ============================================
    // Variant Tests
    // ============================================
    describe('Variants', () => {
        it('applies glass variant styling', () => {
            const { container } = render(<PageLayout variant="glass" />)
            // Glass variant uses bg-gray-900/15 and p-4 for bottom section
            const glassBottomSection = container.querySelector('.bg-gray-900\\/15.p-4')
            expect(glassBottomSection).toBeInTheDocument()
        })

        it('applies sectioned variant styling (default)', () => {
            const { container } = render(<PageLayout variant="sectioned" />)
            // Sectioned variant uses bg-yellow-500 for bottom section
            const yellowSection = container.querySelector('.bg-yellow-500')
            expect(yellowSection).toBeInTheDocument()
        })

        it('defaults to sectioned variant when no variant provided', () => {
            const { container } = render(<PageLayout />)
            const yellowSection = container.querySelector('.bg-yellow-500')
            expect(yellowSection).toBeInTheDocument()
        })

        it('applies h-0 and flex-none to bottomBottom container in glass variant', () => {
            const { container } = render(
                <PageLayout variant="glass" bottomBottom={<span>Bottom</span>} />
            )
            const bottomContainer = container.querySelector('.h-0.flex-none')
            expect(bottomContainer).toBeInTheDocument()
        })

        it('applies flex-1 to bottomBottom container in sectioned variant', () => {
            const { container } = render(
                <PageLayout variant="sectioned" bottomBottom={<span>Bottom</span>} />
            )
            const bottomContainer = container.querySelector('.flex-1.w-full.flex.justify-start.items-end')
            expect(bottomContainer).toBeInTheDocument()
        })
    })

    // ============================================
    // Dialog Integration Tests
    // ============================================
    describe('Dialog Integration', () => {
        it('renders dialog when dialogChildren provided', () => {
            render(
                <PageLayout
                    dialogChildren={<div data-testid="dialog-content">Dialog Content</div>}
                    dialogTitle="Test Dialog"
                />
            )
            expect(screen.getByTestId('dialog')).toBeInTheDocument()
            expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
        })

        it('passes dialogTitle to Dialog component', () => {
            render(
                <PageLayout
                    dialogChildren={<div>Content</div>}
                    dialogTitle="Custom Title"
                />
            )
            expect(screen.getByTestId('dialog')).toHaveAttribute('data-title', 'Custom Title')
        })

        it('uses default dialogTitle when not provided', () => {
            render(
                <PageLayout dialogChildren={<div>Content</div>} />
            )
            expect(screen.getByTestId('dialog')).toHaveAttribute('data-title', 'Info')
        })

        it('does not render dialog when dialogChildren not provided', () => {
            render(<PageLayout />)
            expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
        })
    })

    // ============================================
    // Accessibility Tests
    // ============================================
    describe('Accessibility', () => {
        it('logo link has accessible name', () => {
            render(<PageLayout />)
            const logoLink = screen.getByRole('link', { name: /go to home page/i })
            expect(logoLink).toHaveAttribute('aria-label', 'Go to home page')
        })

        it('logo link points to home route', () => {
            render(<PageLayout />)
            const logoLink = screen.getByRole('link', { name: /go to home page/i })
            expect(logoLink).toHaveAttribute('href', '/')
        })

        it('logo image has alt text', () => {
            render(<PageLayout />)
            expect(screen.getByAltText('Logo')).toBeInTheDocument()
        })

        it('background texture image has alt text', () => {
            render(<PageLayout />)
            expect(screen.getByAltText('Background Texture')).toBeInTheDocument()
        })

        it('logo link has focus styling classes', () => {
            render(<PageLayout />)
            const logoLink = screen.getByRole('link', { name: /go to home page/i })
            expect(logoLink).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-yellow-500')
        })
    })

    // ============================================
    // Custom className Tests
    // ============================================
    describe('Custom className', () => {
        it('applies custom className to container', () => {
            const { container } = render(
                <PageLayout className="custom-test-class" />
            )
            expect(container.querySelector('.custom-test-class')).toBeInTheDocument()
        })

        it('merges custom className with default classes', () => {
            const { container } = render(
                <PageLayout className="custom-class" />
            )
            const mainContainer = container.querySelector('.custom-class')
            expect(mainContainer).toHaveClass('relative', 'h-full', 'w-full', 'bg-gray-800')
        })
    })
})
