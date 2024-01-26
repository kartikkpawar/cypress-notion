"use client";
import { useAppState } from "@/lib/providers/SateProvider";
import { Folder } from "@/lib/supabase/supabase.types";
import React, { Fragment, useEffect, useState } from "react";
import TooltipComponent from "../global/ToolTip";
import { PlusIcon } from "lucide-react";
import { useSupabaseUser } from "@/lib/providers/SupabaseUserProvider";
import { v4 } from "uuid";
import { createFolder } from "@/lib/supabase/queries";
import { useToast } from "../ui/use-toast";
import { Accordion } from "../ui/accordion";
import Dropdown from "./Dropdown";
import useSupabaseRealtime from "@/lib/hooks/useSupabaseRealtime";
import { useSubscriptionModal } from "@/lib/providers/SubscriptionModalProvider";

interface FoldersDropdownListProps {
  workspaceFolders: Folder[];
  workspaceId: string;
}

const FoldersDropdownList: React.FC<FoldersDropdownListProps> = ({
  workspaceFolders,
  workspaceId,
}) => {
  const { state, dispatch, folderId } = useAppState();
  const [folders, setFolders] = useState<Folder[] | []>(workspaceFolders);
  useSupabaseRealtime();
  const { subscription } = useSupabaseUser();
  const { setOpen } = useSubscriptionModal();
  const { toast } = useToast();

  useEffect(() => {
    if (workspaceFolders.length > 0) {
      dispatch({
        type: "SET_FOLDERS",
        payload: {
          workspaceId,
          folders: workspaceFolders.map((folder) => ({
            ...folder,
            files:
              state.workspaces
                .find((wrkspace) => wrkspace.id === workspaceId)
                ?.folders.find((fld) => fld.id === folder.id)?.files || [],
          })),
        },
      });
    }
  }, [workspaceFolders, workspaceId]);

  useEffect(() => {
    setFolders(
      state.workspaces.find((workspace) => workspace.id === workspaceId)
        ?.folders || []
    );
  }, [state, workspaceId]);

  const addFolderHandler = async () => {
    if (folders.length >= 3 && !subscription) {
      setOpen(true);
      return;
    }
    const newFolder: Folder = {
      data: null,
      id: v4(),
      createdAt: new Date().toISOString(),
      title: "Untitled",
      iconId: "📁",
      inTrash: null,
      workspaceId,
      bannerUrl: "",
    };
    dispatch({
      type: "ADD_FOLDER",
      payload: { workspaceId, folder: { ...newFolder, files: [] } },
    });
    const { data, error } = await createFolder(newFolder);
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Could not create the folder",
      });
      return;
    }
    toast({
      title: "Success",
      description: "Created Folder",
    });
    return;
  };

  return (
    <Fragment>
      <div className="flex sticky z-20 top-0 bg-background w-full h-10 group/title items-center justify-between pr-4 text-Neutrals/neutrals-8">
        <span className="text-Neutrals-8 font-bold text-xs">FOLDERS</span>
        <TooltipComponent message="Create Folder">
          <PlusIcon
            onClick={addFolderHandler}
            size={16}
            className="group-hover/title:inline-block
            hidden 
            cursor-pointer
            hover:dark:text-white
          "
          />
        </TooltipComponent>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[folderId || ""]}
        className="pb-20"
      >
        {folders
          .filter((folder) => !folder.inTrash)
          .map((folder) => (
            <Dropdown
              key={folder.id}
              title={folder.title}
              listType="folder"
              id={folder.id}
              iconId={folder.iconId}
            />
          ))}
      </Accordion>
    </Fragment>
  );
};

export default FoldersDropdownList;
