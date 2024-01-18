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
import { Lock, Share } from "lucide-react";
import { Button } from "../ui/button";
import { v4 } from "uuid";
import { addColllaborators, createWorkspace } from "@/lib/supabase/queries";
import CollaboratorSearch from "./CollaboratorSearch";

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
          <CollaboratorSearch />
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
