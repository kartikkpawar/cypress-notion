"use client";
import { useSupabaseUser } from "@/lib/providers/SupabaseUserProvider";
import { User } from "@/lib/supabase/supabase.types";
import React, { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { getUsersFromSearch } from "@/lib/supabase/queries";

interface CollaboratorSearchProps {
  existingCollaborators: User[] | [];
  getCollaborator: (collaborator: User) => void;
  children: React.ReactNode;
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({
  existingCollaborators,
  getCollaborator,
  children,
}) => {
  const { user } = useSupabaseUser();

  const [searchResults, setSearchResults] = useState<User[] | []>([
    {
      id: "1",
      fullName: "John Doe",
      avatarUrl: "https://example.com/avatar1.jpg",
      updatedAt: "2024-01-19T12:30:00Z",
      billingAddress: {
        street: "123 Main St",
        city: "Cityville",
        state: "CA",
        zip: "12345",
        country: "USA",
      },
      paymentMethod: {
        type: "credit_card",
        lastFourDigits: "****5678",
      },
      email: "john.doe@example.com",
    },
    {
      id: "2",
      fullName: "Alice Smith",
      avatarUrl: "https://example.com/avatar2.jpg",
      updatedAt: "2024-01-19T11:45:00Z",
      billingAddress: {
        street: "456 Oak St",
        city: "Townsville",
        state: "NY",
        zip: "67890",
        country: "USA",
      },
      paymentMethod: {
        type: "paypal",
        email: "alice.smith@example.com",
      },
      email: "alice.smith@example.com",
    },
    {
      id: "3",
      fullName: "John Doe",
      avatarUrl: "https://example.com/avatar1.jpg",
      updatedAt: "2024-01-19T12:30:00Z",
      billingAddress: {
        street: "123 Main St",
        city: "Cityville",
        state: "CA",
        zip: "12345",
        country: "USA",
      },
      paymentMethod: {
        type: "credit_card",
        lastFourDigits: "****5678",
      },
      email: "john.doe2@example.com",
    },
    {
      id: "4",
      fullName: "Alice Smith",
      avatarUrl: "https://example.com/avatar2.jpg",
      updatedAt: "2024-01-19T11:45:00Z",
      billingAddress: {
        street: "456 Oak St",
        city: "Townsville",
        state: "NY",
        zip: "67890",
        country: "USA",
      },
      paymentMethod: {
        type: "paypal",
        email: "alice.smith@example.com",
      },
      email: "alice.smith2@example.com",
    },
    {
      id: "5",
      fullName: "John Doe",
      avatarUrl: "https://example.com/avatar1.jpg",
      updatedAt: "2024-01-19T12:30:00Z",
      billingAddress: {
        street: "123 Main St",
        city: "Cityville",
        state: "CA",
        zip: "12345",
        country: "USA",
      },
      paymentMethod: {
        type: "credit_card",
        lastFourDigits: "****5678",
      },
      email: "john.doe3@example.com",
    },
    {
      id: "6",
      fullName: "Alice Smith",
      avatarUrl: "https://example.com/avatar2.jpg",
      updatedAt: "2024-01-19T11:45:00Z",
      billingAddress: {
        street: "456 Oak St",
        city: "Townsville",
        state: "NY",
        zip: "67890",
        country: "USA",
      },
      paymentMethod: {
        type: "paypal",
        email: "alice.smith@example.com",
      },
      email: "alice.smith3@example.com",
    },
    {
      id: "7",
      fullName: "John Doe",
      avatarUrl: "https://example.com/avatar1.jpg",
      updatedAt: "2024-01-19T12:30:00Z",
      billingAddress: {
        street: "123 Main St",
        city: "Cityville",
        state: "CA",
        zip: "12345",
        country: "USA",
      },
      paymentMethod: {
        type: "credit_card",
        lastFourDigits: "****5678",
      },
      email: "john.doe4@example.com",
    },
    {
      id: "8",
      fullName: "Alice Smith",
      avatarUrl: "https://example.com/avatar2.jpg",
      updatedAt: "2024-01-19T11:45:00Z",
      billingAddress: {
        street: "456 Oak St",
        city: "Townsville",
        state: "NY",
        zip: "67890",
        country: "USA",
      },
      paymentMethod: {
        type: "paypal",
        email: "alice.smith4@example.com",
      },
      email: "alice.smith4@example.com",
    },
  ]);

  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timerRef) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(async () => {
      const res = await getUsersFromSearch(e.target.value);
      setSearchResults(res);
    }, 450);
  };

  const addColllaborator = (user: User) => {
    getCollaborator(user);
  };

  return (
    <Sheet>
      <SheetTrigger className="w-full ">{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Search Collaborator</SheetTitle>
          <SheetDescription>
            <p className="text-sm text-muted-foreground">
              You can also remove collaborators after adding them from the
              settings tab.
            </p>
          </SheetDescription>
        </SheetHeader>
        <div className="flex justify-center items-center gap-2 mt-2">
          <Search />{" "}
          <Input
            name="name"
            className="dark:bg-background"
            placeholder="Email"
            onChange={onChangeHandler}
          />
        </div>
        <ScrollArea className="mt-6 overflow-y-scroll w-full rounded-md">
          {searchResults
            .filter(
              (result) =>
                !existingCollaborators.some(
                  (existing) => existing.id === result.id
                )
            )
            .filter((result) => result.id !== user?.id)
            .map((_user) => (
              <div
                className="p-4 flex justify-between items-center"
                key={_user?.id}
              >
                <div className="flex gap-4 items-center">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/avatars/7.png" />
                    <AvatarFallback>CP</AvatarFallback>
                  </Avatar>
                  <div className="text-sm g-2 overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                    {_user?.email}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => addColllaborator(_user)}
                >
                  Add
                </Button>
              </div>
            ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CollaboratorSearch;
