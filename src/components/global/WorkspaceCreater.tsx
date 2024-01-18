"use client";
import { useSupabaseUser } from "@/lib/providers/SupabaseUserProvider";
import { User, Workspace } from "@/lib/supabase/supabase.types";
import { useRouter } from "next/navigation";
import React, { Fragment, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Plus, Share } from "lucide-react";
import { Button } from "../ui/button";
import { v4 } from "uuid";
import { addColllaborators, createWorkspace } from "@/lib/supabase/queries";
import CollaboratorSearch from "./CollaboratorSearch";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

const WorkspaceCreater = () => {
  const [permissions, setPermissions] = useState("private");
  const [title, setTitle] = useState("");
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const { user } = useSupabaseUser();

  const router = useRouter();

  const addColllaborator = (user: User) => {
    setCollaborators([...collaborators, user]);
  };
  const removeColllaborator = (user: User) => {
    setCollaborators(collaborators.filter((c) => c.id !== user.id));
  };
  const createItem = async () => {
    const uuid = v4();
    if (user?.id) {
      const newWorkspace: Workspace = {
        data: null,
        createdAt: new Date().toISOString(),
        iconId: "💼",
        id: uuid,
        inTrash: "",
        title,
        workspaceOwner: user.id,
        logo: null,
        bannerUrl: "",
      };
      if (permissions === "private") {
        await createWorkspace(newWorkspace);
        router.refresh();
      }
      if (permissions === "shared") {
        await createWorkspace(newWorkspace);
        await addColllaborators(collaborators, uuid);
        router.refresh();
      }
    }
  };

  return (
    <div className="flex gap-4 flex-col">
      <div className="">
        <Label htmlFor="name" className="text-sm text-muted-foreground">
          Name
        </Label>
        <div className="flex justify-center items-center gap-2">
          <Input
            name="name"
            value={title}
            placeholder="Workspace name"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <Fragment>
        <Label htmlFor="permissions" className="text-sm text-muted-foreground">
          Permission
        </Label>
        <Select
          onValueChange={(value) => {
            setPermissions(value);
          }}
          defaultValue={permissions}
        >
          <SelectTrigger className="w-full h-26 -mt-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">
              <div className="p-2 flex gap-4 justify-center items-center">
                <Lock />
                <article className="text-left flex flex-col">
                  <span>Private</span>
                  <p>
                    Your workspace is private to you. You can choose to share it
                    later.
                  </p>
                </article>
              </div>
            </SelectItem>
            <SelectItem value="shared">
              <div className="p-2 flex gap-4 justify-center items-center">
                <Share />
                <article className="text-left flex flex-col">
                  <span>Shared</span>
                  <span>You can invite collaborators.</span>
                </article>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </Fragment>
      {permissions === "shared" && (
        <div>
          <CollaboratorSearch
            existingCollaborators={collaborators}
            getCollaborator={(user) => {
              addColllaborator(user);
            }}
          >
            <Button type="button" className="text-sm mt-4">
              <Plus />
              Add Collaborator
            </Button>
          </CollaboratorSearch>
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">
              Collaborators {collaborators.length || ""}
            </span>
            <ScrollArea className="h-[120px] overflow-y-scroll w-full rounded-md border border-muted-foreground/20">
              {collaborators.length ? (
                collaborators.map((c) => (
                  <div
                    className="p-4 flex justify-between items-center"
                    key={c.id}
                  >
                    <div className="flex gap-4 items-center">
                      <Avatar>
                        <AvatarImage src="/avatars/7.png" />
                        <AvatarFallback>CP</AvatarFallback>
                      </Avatar>
                      <div className="text-sm gap-2 to-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]">
                        {c.email}
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => removeColllaborator(c)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <div className="absolute inset-0 flex justify-center items-center">
                  <span className="text-muted-foreground text-sm">
                    You have no collaborators
                  </span>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
      <Button
        className="button"
        disabled={
          !title || (permissions === "shared" && collaborators.length === 0)
        }
        variant="secondary"
        onClick={createItem}
      >
        Create
      </Button>
    </div>
  );
};

export default WorkspaceCreater;
