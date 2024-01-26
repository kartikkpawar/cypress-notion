"use client";
import { useSubscriptionModal } from "@/lib/providers/SubscriptionModalProvider";
import { Price, ProductWithPrice } from "@/lib/supabase/supabase.types";
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
import { formatPrice, postData } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { getStripe } from "@/lib/stripe/stripeClient";

interface SubscriptionModalProps {
  products: ProductWithPrice[];
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ products }) => {
  const { open, setOpen } = useSubscriptionModal();
  const { toast } = useToast();
  const { subscription } = useSupabaseUser();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSupabaseUser();

  const onClickContinue = async (price: Price) => {
    try {
      setIsLoading(true);
      if (!user) {
        toast({ title: "You must be logged in" });
        setIsLoading(false);
        return;
      }
      if (subscription) {
        toast({ title: "Already on a paid plan" });
        setIsLoading(false);
        return;
      }
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price },
      });

      console.log("Getting Checkout for stripe");
      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast({ title: "Oppse! Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

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
          {products.length
            ? products.map((product) => (
                <div
                  className="flex justify-between items-center"
                  key={product.id}
                >
                  {product.prices?.map((price) => (
                    <Fragment key={price.id}>
                      <b className="text-3xl text-foreground">
                        {formatPrice(price)}/ <small>{price.interval}</small>
                      </b>
                      <Button
                        disabled={isLoading}
                        onClick={() => onClickContinue(price)}
                      >
                        {isLoading ? <Loader /> : "Upgrade ✨"}
                      </Button>
                    </Fragment>
                  ))}
                </div>
              ))
            : ""}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SubscriptionModal;
