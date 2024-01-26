"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useAppState } from "@/lib/providers/SateProvider";
import { User, Workspace } from "@/lib/supabase/supabase.types";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/lib/providers/SupabaseUserProvider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Briefcase,
  CreditCard,
  ExternalLink,
  Lock,
  LogOut,
  Plus,
  Share,
  User as UserIcon,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  addColllaborators,
  deleteWorkspace,
  getCollaborators,
  removeColllaborators,
  updateWorkspace,
} from "@/lib/supabase/queries";
import { v4 } from "uuid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import CollaboratorSearch from "../global/CollaboratorSearch";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import CypressProfileIcon from "../icons/cypressProfileIcon";
import LogoutButton from "../global/Logout";
import Link from "next/link";
import { useSubscriptionModal } from "@/lib/providers/SubscriptionModalProvider";

interface SettingsFormsProps {}

const SettingsForm: React.FC<SettingsFormsProps> = () => {
  const { toast } = useToast();
  const { state, workspaceId, dispatch } = useAppState();
  const { user, subscription } = useSupabaseUser();
  const { setOpen } = useSubscriptionModal();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [permissions, setPermissions] = useState("private");
  const [collaborators, setCollaborators] = useState<User[] | []>([]);
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [workspaceDetails, setWorkspaceDetails] = useState<Workspace>();
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.value) return;
    dispatch({
      type: "UPDATE_WORKSPACE",
      payload: { workspace: { title: e.target.value }, workspaceId },
    });
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      await updateWorkspace({ title: e.target.value }, workspaceId);
    }, 500);
  };
  const uploadWorkspaceLogo = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!workspaceId || !file) return;

    const uuid = v4();
    setUploadingLogo(true);
    const { data, error } = await supabase.storage
      .from("workspace-logos")
      .upload(`workspaceLogo.${uuid}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!error) {
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: { workspace: { logo: data.path }, workspaceId },
      });
      await updateWorkspace({ logo: data.path }, workspaceId);
      setUploadingLogo(false);
    }
  };

  const addColllaborator = async (profile: User) => {
    if (!workspaceId) return;

    if (subscription?.status !== "active" && collaborators.length >= 2) {
      setOpen(true);
      return;
    }

    await addColllaborators([profile], workspaceId);
    setCollaborators([...collaborators, profile]);
  };
  const removeColllaborator = async (user: User) => {
    if (!workspaceId) return;
    if (collaborators.length === 1) {
      setPermissions("private");
    }
    await removeColllaborators([user], workspaceId);
    setCollaborators(collaborators.filter((c) => c.id !== user.id));
  };

  const onPermissionsChange = (val: string) => {
    if (val === "private") {
      setOpenAlertMessage(true);
    } else {
      setPermissions(val);
    }
  };

  const onClickAlertConfirm = async () => {
    if (!workspaceId) return;
    if (collaborators.length > 0) {
      await removeColllaborators(collaborators, workspaceId);
    }
    setPermissions("private");
    setOpenAlertMessage(false);
  };

  useEffect(() => {
    const showingWorkspace = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    if (showingWorkspace) {
      setWorkspaceDetails(showingWorkspace);
    }
  }, [workspaceId, state]);

  useEffect(() => {
    if (!workspaceId) return;
    const fetchCollaborators = async () => {
      const res = await getCollaborators(workspaceId);
      if (res.length) {
        setPermissions("shared");
        setCollaborators(res);
      }
    };
    fetchCollaborators();
  }, [workspaceId]);

  return (
    <div className="flex gap-4 flex-col">
      <p className="flex items-center gap-2 mt-6">
        <Briefcase size={20} />
      </p>
      <Separator />
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="workspaceName"
          className="text-sm text-muted-foreground"
        >
          Name
        </Label>
        <Input
          name="workspaceName"
          placeholder="Workspace Title"
          value={workspaceDetails?.title || ""}
          onChange={workspaceNameChange}
        />{" "}
        <Label
          htmlFor="worksapceLogo"
          className="text-sm text-muted-foreground"
        >
          Workspace Logo
        </Label>
        <Input
          name="worksapceLogo"
          type="file"
          accept="image/*"
          placeholder="Workspace Logo"
          onChange={uploadWorkspaceLogo}
          disabled={uploadingLogo || subscription?.status !== "active"}
        />
        {subscription?.status !== "active" && (
          <small className="text-muted-foreground">
            To customize your workspace, you need to be on a pro plan
          </small>
        )}
      </div>
      <Fragment>
        <Label htmlFor="permissions" className="text-sm text-muted-foreground">
          Permission
        </Label>
        <Select onValueChange={onPermissionsChange} value={permissions}>
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
        <Alert variant="destructive">
          <AlertDescription>
            Warning! deleting you workspace will permanantly delete all data
            related to this workspace.
          </AlertDescription>
          <Button
            type="submit"
            size={"sm"}
            variant={"destructive"}
            className="mt-4 
            text-sm
            bg-destructive/40 
            border-2 
            border-destructive"
            onClick={async () => {
              if (!workspaceId) return;
              await deleteWorkspace(workspaceId);
              toast({ title: "Successfully deleted your workspae" });
              dispatch({ type: "DELETE_WORKSPACE", payload: workspaceId });
              router.replace("/dashboard");
            }}
          >
            Delete Workspace
          </Button>
        </Alert>
        <p className="flex items-center gap-2 mt-6">
          <UserIcon size={20} /> Profile
        </p>
        <Separator />
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={""} />
            <AvatarFallback>
              <CypressProfileIcon />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col ml-6">
            <small className="text-muted-foreground cursor-not-allowed">
              {user ? user.email : ""}
            </small>
            <Label
              htmlFor="profilePicture"
              className="text-sm text-muted-foreground"
            >
              Profile Picture
            </Label>
            <Input
              name="profilePicture"
              type="file"
              accept="image/*"
              placeholder="Profile Picture"
              // onChange={onChangeProfilePicture}
              disabled={uploadingProfilePic}
            />
          </div>
        </div>
        <LogoutButton>
          <div className="flex items-center">
            <LogOut />
          </div>
        </LogoutButton>
        <p className="flex items-center gap-2 mt-6">
          <CreditCard size={20} /> Billing & Plan
        </p>
        <Separator />
        <p className="text-muted-foreground">
          {subscription?.status === "active" ? "Pro" : "Free"} Plan
        </p>
        <Link
          href="/"
          target="_blank"
          className="text-muted-foreground flex flex-row items-center gap-2"
        >
          View Plans <ExternalLink size={16} />
        </Link>
        {subscription?.status === "active" ? (
          <div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              // disabled={isLoadingPortal}
              className="text-sm"
              // onClick={redirectToCustomerPortal}
            >
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              // disabled={isLoadingPortal}
              className="text-sm"
              onClick={() => {
                setOpen(true);
              }}
            >
              Start Plan
            </Button>
          </div>
        )}
      </Fragment>
      <AlertDialog open={openAlertMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertTitle>Are you sure?</AlertTitle>
          </AlertDialogHeader>
          <AlertDescription>
            Changing a Shared workspace to a Private workspace will remove all
            collborators premanantly.
          </AlertDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onClickAlertConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsForm;
