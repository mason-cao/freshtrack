"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddItemDialog } from "@/components/pantry/add-item-dialog";

interface FabProps {
  onItemAdded: () => void;
}

export function Fab({ onItemAdded }: FabProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sage-500 text-white shadow-warm-lg hover:bg-sage-600 transition-colors cursor-pointer bottom-20 right-4 md:bottom-6 md:right-6"
        aria-label="Add item"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <AddItemDialog
        onItemAdded={() => {
          onItemAdded();
          setOpen(false);
        }}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
