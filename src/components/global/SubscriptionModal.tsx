"use client";
import { useSubscriptionModal } from "@/lib/providers/SubscriptionModalProvider";
import { ProductWirhPrice } from "@/lib/supabase/supabase.types";
import React, { Fragment, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useSupabaseUser } from "@/lib/providers/SupabaseUserProvider";
import { Button } from "../ui/button";
import Loader from "./Loader";

interface SubscriptionModalProps {
  products: ProductWirhPrice[];
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = () => {
  const { open, setOpen } = useSubscriptionModal();
  const { subscription } = useSupabaseUser();
  const [isLoading, setIsLoading] = useState(false);

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
          <div className="flex justify-between items-center ">
            <Fragment>
              <b className="text-3xl text-foreground">
                $12.99/ <small>month</small>
              </b>
              <Button disabled={isLoading}>
                {isLoading ? <Loader /> : "Upgrade ✨"}
              </Button>
            </Fragment>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SubscriptionModal;
