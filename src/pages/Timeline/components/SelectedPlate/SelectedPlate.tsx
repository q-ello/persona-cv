import { motion } from "framer-motion";
import "./SelectedPlate.css";

export function SelectedPlate({ position }: { position: { x: number; y: number; w: number; h: number } | null }) {
    if (!position) return null;

    return (
        <motion.div
            className="selected-plate bg-red-700"
            initial={false}
            animate={{
                x: position.x - 20,
                y: position.y + 10,
                width: position.w * 1.3,
                height: position.h,
                borderRadius: 4,
            }}
            transition={{
                type: "spring",
                stiffness: 280,
                damping: 28,
                mass: 0.8,
            }}
        />
    );
}
