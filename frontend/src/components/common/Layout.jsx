import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';

// Transitions.dev — Page Side-by-Side / Route Transition (08-page-side-by-side.md)
// 250ms smooth rise with subtle blur entrance; quiet 120ms exit to prevent layout drag
const pageVariants = {
    initial: {
        opacity: 0,
        y: 6,
        filter: 'blur(2px)',
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -4,
        filter: 'blur(1px)',
        transition: {
            duration: 0.12,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

export const Layout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#e8f1fc] dark:bg-[#0c0e14] text-gray-900 dark:text-white transition-colors duration-200 flex flex-col">
            {/* Workspace Navigation (Vertical Rail on desktop, Top Header on mobile) */}
            <Navbar />

            {/* Main Content Area: Offset beside floating sidebar on desktop, below header on mobile */}
            <div className="flex-1 md:pl-[256px] transition-[padding] duration-200">
                <main className="pt-20 md:pt-4 px-4 sm:px-6 lg:px-7 pb-10 mx-auto max-w-[1280px] w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Layout;
