"use client";
import { useSubscriptionModal } from "@/lib/providers/SubscriptionModalProvider";
import { ProductWirhPrice } from "@/lib/supabase/supabase.types";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useSupabaseUser } from "@/lib/providers/SupabaseUserProvider";

interface SubscriptionModalProps {
  products: ProductWirhPrice[];
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = () => {
  const { open, setOpen } = useSubscriptionModal();
  const { subscription } = useSupabaseUser();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {subscription?.status == "active" ? (
        <DialogContent>Already on a plan!</DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to a Pro Plan</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            To access features you need to have a paid plan.
          </DialogDescription>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SubscriptionModal;
// 10-16
