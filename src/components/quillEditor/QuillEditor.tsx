"use client";
import { useAppState } from "@/lib/providers/SateProvider";
import { File, Folder, Workspace } from "@/lib/supabase/supabase.types";
import React, { Fragment, useCallback, useMemo, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import { Button } from "../ui/button";
import {
  deleteFile,
  deleteFolder,
  deleteWorkspace,
  updateFile,
  updateFolder,
  updateWorkspace,
} from "@/lib/supabase/queries";
import { useToast } from "../ui/use-toast";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import EmojiPicker from "../global/EmojiPicker";
import BannerUpload from "../bannerUpload/BannerUpload";
import { XCircle } from "lucide-react";

interface QuillEditorProps {
  dirDetails: File | Folder | Workspace;
  fileId: string;
  dirType: "workspace" | "folder" | "file";
}

var TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];

const QuillEditor: React.FC<QuillEditorProps> = ({
  dirDetails,
  dirType,
  fileId,
}) => {
  const [quill, setQuill] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<
    {
      id: string;
      email: string;
      avatar: string;
    }[]
  >([]);

  const [saving, setSaving] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState(false);
  const { state, workspaceId, folderId, dispatch } = useAppState();
  const { toast } = useToast();
  const pathname = usePathname();

  const supabase = createClientComponentClient();

  const details = useMemo(() => {
    let selectedDir;
    if (dirType === "file") {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === folderId)
        ?.files.find((file) => file.id == fileId);
    }
    if (dirType === "folder") {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === fileId);
    }
    if (dirType === "workspace") {
      selectedDir = state.workspaces.find(
        (workspace) => workspace.id === fileId
      );
    }
    if (selectedDir) return selectedDir;

    return {
      title: dirDetails.title,
      iconId: dirDetails.iconId,
      createdAt: dirDetails.createdAt,
      data: dirDetails.data,
      inTrash: dirDetails.inTrash,
      bannerUrl: dirDetails.bannerUrl,
    } as Workspace | Folder | File;
  }, [state, workspaceId, folderId]);

  const wrapperRef = useCallback(async (wrapper: any) => {
    if (typeof window !== "undefined") {
      if (wrapper === null) return;
      wrapper.innerHTML = "";
      const editor = document.createElement("div");
      wrapper.append(editor);
      const Quill = (await import("quill")).default;
      const q = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
        },
      });
      setQuill(q);
    }
  }, []);

  const restoreFile = async () => {
    if (dirType === "file") {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: "UPDATE_FILE",
        payload: { file: { inTrash: "" }, fileId, folderId, workspaceId },
      });
      await updateFile({ inTrash: "" }, fileId);
      toast({
        title: "Success",
        description: "File restored successfully",
      });
    }
    if (dirType === "folder") {
      if (!workspaceId) return;
      dispatch({
        type: "UPDATE_FOLDER",
        payload: { folder: { inTrash: "" }, folderId: fileId, workspaceId },
      });
      await updateFolder({ inTrash: "" }, fileId);
      toast({
        title: "Success",
        description: "Folder restored successfully",
      });
    }
  };

  const permanentDeleteFile = async () => {
    if (dirType === "file") {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: "DELETE_FILE",
        payload: { workspaceId, folderId, fileId },
      });
      await deleteFile(fileId);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    }
    if (dirType === "folder") {
      if (!workspaceId) return;
      dispatch({
        type: "DELETE_FOLDER",
        payload: { workspaceId, folderId: fileId },
      });
      await deleteFolder(fileId);
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
    }
    if (dirType === "workspace") {
      if (!workspaceId) return;
      dispatch({
        type: "DELETE_WORKSPACE",
        payload: workspaceId,
      });
      await deleteWorkspace(fileId);
      toast({
        title: "Success",
        description: "Workspace deleted successfully",
      });
    }
  };

  const breadCrumbs = useMemo(() => {
    if (!pathname || !state.workspaces || !workspaceId) return;
    const segments = pathname
      .split("/")
      .filter((val) => val !== "dashboard" && val);
    const workspaceDetails = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    const workspaceBreadCrumb = workspaceDetails
      ? `${workspaceDetails.iconId} ${workspaceDetails.title}`
      : "";
    if (segments.length === 1) {
      return workspaceBreadCrumb;
    }

    const folderSegment = segments[1];
    const folderDetails = workspaceDetails?.folders.find(
      (folder) => folder.id === folderSegment
    );
    const folderBreadCrumb = folderDetails
      ? `/ ${folderDetails.iconId} ${folderDetails.title}`
      : "";

    if (segments.length === 2) {
      return `${workspaceBreadCrumb} ${folderBreadCrumb}`;
    }

    const fileSegment = segments[2];
    const fileDetails = folderDetails?.files.find(
      (file) => file.id === fileSegment
    );
    const fileBreadCrumb = fileDetails
      ? `/ ${fileDetails.iconId} ${fileDetails.title}`
      : "";

    return `${workspaceBreadCrumb} ${folderBreadCrumb} ${fileBreadCrumb}`;
  }, [state, pathname, workspaceId]);

  const iconOnChange = async (iconId: string) => {
    if (!fileId) return;
    if (dirType === "workspace" && workspaceId) {
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: { workspace: { iconId }, workspaceId: fileId },
      });
      await updateWorkspace({ iconId }, fileId);
    }
    if (dirType === "folder") {
      if (!workspaceId) return;
      dispatch({
        type: "UPDATE_FOLDER",
        payload: { folder: { iconId }, folderId: fileId, workspaceId },
      });
      await updateFolder({ iconId }, fileId);
    }
    if (dirType === "file") {
      if (!workspaceId || !folderId) return;
      dispatch({
        type: "UPDATE_FILE",
        payload: { file: { iconId }, workspaceId, fileId, folderId },
      });
      await updateFile({ iconId }, fileId);
    }
  };

  const deleteBanner = async () => {
    if (!fileId) return;
    setDeletingBanner(true);
    if (dirType === "file") {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: "UPDATE_FILE",
        payload: { file: { bannerUrl: "" }, fileId, folderId, workspaceId },
      });
      await supabase.storage.from("file-banners").remove([`banner-${fileId}`]);
      await updateFile({ bannerUrl: "" }, fileId);
    }
    if (dirType === "folder") {
      if (!workspaceId) return;
      dispatch({
        type: "UPDATE_FOLDER",
        payload: { folder: { bannerUrl: "" }, folderId: fileId, workspaceId },
      });
      await supabase.storage.from("file-banners").remove([`banner-${fileId}`]);
      await updateFolder({ bannerUrl: "" }, fileId);
    }
    if (dirType === "workspace") {
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: {
          workspace: { bannerUrl: "" },
          workspaceId: fileId,
        },
      });
      await supabase.storage.from("file-banners").remove([`banner-${fileId}`]);
      await updateWorkspace({ bannerUrl: "" }, fileId);
    }
    setDeletingBanner(false);
  };

  return (
    <Fragment>
      <div className="relative ">
        {details.inTrash && (
          <article className="py-2 bg-[#EB5757] flex md:flex-row flex-col justify-center items-center gap-4 flex-wrap">
            <div className="flex flex-col gap-2 justify-center items-center md:flex-row">
              <span className="text-white">This {dirType} is in the trash</span>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border border-white text-white hover:text-[#EB5757]"
                onClick={restoreFile}
              >
                Restore
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border border-white text-white hover:text-[#EB5757]"
                onClick={permanentDeleteFile}
              >
                Delete
              </Button>
            </div>
            <span className="text-sm text-white">{details.inTrash}</span>
          </article>
        )}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between justify-center sm:items-center sm:p-2 p-8">
          {breadCrumbs}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10">
              {collaborators.map((collaborator) => (
                <TooltipProvider key={collaborator.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="-ml-3 bg-background border-2 flex items-center justify-center border-white h-8 w-8 rounded-full">
                        <AvatarImage
                          src={collaborator.avatar || "/avatars/5.png"}
                          className="rounded-full"
                        />
                        <AvatarFallback>
                          {collaborator.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{collaborator.email}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {saving ? (
                <Badge
                  variant="secondary"
                  className="bg-orange-600 top-4 text-white right-4 z-50"
                >
                  Saving...
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-emerald-600 top-4 text-white right-4 z-50"
                >
                  Saved
                </Badge>
              )}
            </div>
          </div>
        </div>
        {details.bannerUrl && (
          <div className="relative w-full h-[200px]">
            <Image
              fill
              className="w-full md:h-48 h-20 object-cover"
              src={
                supabase.storage
                  .from("file-banners")
                  .getPublicUrl(details.bannerUrl).data.publicUrl
              }
              alt="Banner image"
            />
          </div>
        )}
      </div>
      <div className="flex justify-center items-center flex-col mt-2 relative">
        <div className="w-full self-center max-w-[800px] flex flex-col px-7 lg:my-8">
          <div className="text-[80px]">
            <EmojiPicker getValue={iconOnChange}>
              <div className="w-[100px] cursor-pointer transition-colors h-[100px] flex items-center justify-center hover:bg-muted rounded-xl">
                {details.iconId}
              </div>
            </EmojiPicker>
          </div>
          <div className="flex">
            <BannerUpload
              id={fileId}
              dirType={dirType}
              className=" mt-2 text-sm text-muted-foreground  p-2 hover:text-card-foreground transition-all rounded-md"
            >
              {details.bannerUrl ? "Update Banner" : "Add Banner"}
            </BannerUpload>
            {details.bannerUrl && (
              <Button
                variant="ghost"
                className="g-2 hover:bg-background flex items-center justify-center mt-2 text-sm text-muted-foreground w-36 p-2 rounded-md"
                onClick={deleteBanner}
                disabled={deletingBanner}
              >
                <XCircle size={16} />
                <span className="whitespace-nowrap font-normal ml-1">
                  Remove Banner
                </span>
              </Button>
            )}
          </div>
          <span className="text-muted-foreground text-3xl font-bold h-9">
            {details.title}
          </span>
          <span className="text-muted-foreground text-sm">
            {dirType.toLocaleUpperCase()}
          </span>
        </div>
        <div id="contianer" className="max-w-[800px]" ref={wrapperRef} />
      </div>
    </Fragment>
  );
};

export default QuillEditor;
