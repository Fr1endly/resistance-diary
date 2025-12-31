import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer" 
import { Link } from "@tanstack/react-router"
import MenuIcon from '@/components/icons/Menu'
import { cn } from "@/lib/utils"

interface NavDrawerProps {
    children: ReactNode
    variant?: 'sectioned' | 'singular' | 'glass'
}

/**
 * Navigation drawer component that wraps content and provides a bottom-right
 * menu trigger button for app navigation.
 */
export default function Menu({ children, variant = 'sectioned' }: NavDrawerProps) {
    return (
        <Drawer>
            <DrawerContent className="bg-yellow-500 font-display">
                <div className="w-full flex flex-col justify-end items-end">
                    <DrawerHeader>
                        <DrawerTitle>Navigation.</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                        <div className="flex flex-col items-end justify-end gap-3">
                            <Link to="/profile">Profile</Link>
                            <Link to="/workouts">Workouts</Link>
                            <Link to="/">Index</Link>
                        </div>
                        <div className="h-[35px]" />
                    </div>
                    <DrawerFooter className="p-6 flex justify-center items-center">
                        <DrawerClose asChild>
                            <Button variant="outline" className="rounded-full text-xl font-black">
                                x
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>

            {children}

            <NavDrawerTrigger variant={variant} />
        </Drawer>
    )
}

interface NavDrawerTriggerProps {
    variant?: 'sectioned' | 'singular' | 'glass'
}

/**
 * Standalone trigger button for the NavDrawer, positioned at bottom-right.
 * Adapts styling based on the current layout variant.
 */
export function NavDrawerTrigger({ variant = 'sectioned' }: NavDrawerTriggerProps) {
    return (
        <div className="absolute right-2 bottom-6 z-50">
            <DrawerTrigger asChild>
                <Button
                    className={cn(
                        "border-0 shadow-lg",
                        variant === 'glass'
                            ? "backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20"
                            : "bg-amber-400 text-black"
                    )}
                >
                    <MenuIcon
                        className={cn(
                            variant === 'glass' ? "stroke-white" : "stroke-neutral-950"
                        )}
                    />
                </Button>
            </DrawerTrigger>
        </div>
    )
}
