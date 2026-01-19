import { motion } from 'motion/react'
import { Link } from '@tanstack/react-router'
import NavDrawer from './DrawerMenu'
import type { ReactNode } from 'react'
import LogoImg from '/images/logo.png'
import BgTextureImg from '/images/bg-texture.png'
import { cn } from '@/lib/utils'
import Dialog from '@/components/ui/Dialog'

// Layout height configuration by variant
const LAYOUT_CONFIG = {
  sectioned: { upper: '66%', middle: '80%', bottom: '34%' },
  glass: { upper: '7%', middle: '0', bottom: '93%' },
} as const

// Shared fade animation props
const fadeAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

type LayoutVariant = keyof typeof LAYOUT_CONFIG

interface PageLayoutProps {
  className?: string
  variant?: LayoutVariant
  // Slot props
  upperSlot?: ReactNode
  middleLeftSlot?: ReactNode
  middleRightSlot?: ReactNode
  bottomSlot?: ReactNode
  // Dialog props (opt-in)
  dialogChildren?: ReactNode
  dialogTitle?: string
}

const PageLayout = ({
  className,
  variant = 'sectioned',
  // Slots
  upperSlot,
  middleLeftSlot,
  middleRightSlot,
  bottomSlot,
  // Dialog
  dialogChildren,
  dialogTitle = 'Info',
}: PageLayoutProps) => {
  const config = LAYOUT_CONFIG[variant]

  return (
    <>
      <div
        className={cn(
          'relative h-full w-full bg-gray-800 flex-col justify-end',
          className,
        )}
      >
        {/* Dialog overlay - only renders when dialogChildren provided */}
        {dialogChildren && (
          <div className="w-full h-full absolute top-0 left-0 z-50 pointer-events-none">
            <Dialog title={dialogTitle}>{dialogChildren}</Dialog>
          </div>
        )}

        <NavDrawer variant={variant}>
          <div className="h-13 w-13 absolute top-5 left-5 z-50">
            <Link
              to="/"
              aria-label="Go to home page"
              className="focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-sm"
            >
              <img
                src={LogoImg}
                alt="Logo"
                className="h-full w-full object-cover"
              />
            </Link>
          </div>

          {/* background texture */}
          <div className="bg-gray-900/90 w-full h-full z-20 absolute top-0">
            <img
              src={BgTextureImg}
              alt="Background Texture"
              className="h-full w-full object-cover opacity-28 z-0"
            />
          </div>

          {/* content - transparent section  */}
          <div className="relative h-full w-full z-30 ">
            {/* Top section */}
            <motion.div
              className="flex flex-col justify-end relative"
              {...fadeAnimation}
              style={{ height: config.upper }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <div className="flex-1 h-full flex flex-col justify-end items-center text-neutral-100 relative z-30">
                {upperSlot}
              </div>

              <motion.div
                className="w-full bg-gray-900/15 relative z-30 flex justify-between items-end overflow-auto"
                style={{ height: config.middle }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                {middleLeftSlot}
                <div className="flex-1 h-full flex flex-col justify-between items-end">
                  {middleRightSlot}
                </div>
              </motion.div>
            </motion.div>

            {/* Bottom section - yellow for sectioned/singular, glass for glass variant */}
            <motion.div
              className={cn(
                'flex flex-col justify-start items-start overflow-hidden relative z-30',
                variant === 'glass'
                  ? 'p-4 h-full w-full bg-gray-900/15'
                  : 'p-6 pr-6 bg-yellow-500',
              )}
              style={{ height: config.bottom }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              {...fadeAnimation}
            >
              {bottomSlot}
            </motion.div>
          </div>
        </NavDrawer>
      </div>
    </>
  )
}

export default PageLayout
