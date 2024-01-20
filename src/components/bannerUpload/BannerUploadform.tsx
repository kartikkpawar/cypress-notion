import { useAppState } from "@/lib/providers/SateProvider";
import { UploadBannerFormSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Loader from "../global/Loader";
import { useToast } from "../ui/use-toast";
import {
  updateFile,
  updateFolder,
  updateWorkspace,
} from "@/lib/supabase/queries";

interface BannerUploadformProps {
  dirType: "workspace" | "file" | "folder";
  id: string;
}

const BannerUploadform: React.FC<BannerUploadformProps> = ({ dirType, id }) => {
  const supabase = createClientComponentClient();
  const { workspaceId, folderId, state, dispatch } = useAppState();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isUploading, errors },
  } = useForm<z.infer<typeof UploadBannerFormSchema>>({
    mode: "onChange",
    // resolver: zodResolver(UploadBannerFormSchema),
    defaultValues: {
      banner: "",
    },
  });

  const onSubmitHandler: SubmitHandler<
    z.infer<typeof UploadBannerFormSchema>
  > = async (values) => {
    const file = values.banner?.[0];
    if (!file || !id) return;

    try {
      let filePath = null;
      const uploadBanner = async () => {
        const { data, error } = await supabase.storage
          .from("file-banners")
          .upload(`banner-${id}`, file, { cacheControl: "5", upsert: true });
        if (error) {
          return toast({
            title: "Error",
            description: "Unable to upload banner",
            variant: "destructive",
          });
        }
        filePath = data.path;
      };
      if (dirType === "workspace") {
        if (!workspaceId) return;
        await uploadBanner();
        dispatch({
          type: "UPDATE_WORKSPACE",
          payload: {
            workspace: { bannerUrl: filePath },
            workspaceId,
          },
        });
        await updateWorkspace({ bannerUrl: filePath }, id);
      } else if (dirType === "folder") {
        if (!workspaceId || !folderId) return;
        await uploadBanner();
        dispatch({
          type: "UPDATE_FOLDER",
          payload: {
            folderId: id,
            folder: { bannerUrl: filePath },
            workspaceId,
          },
        });
        await updateFolder({ bannerUrl: filePath }, id);
      } else if (dirType === "file") {
        if (!workspaceId || !folderId) return;
        await uploadBanner();
        dispatch({
          type: "UPDATE_FILE",
          payload: {
            file: { bannerUrl: filePath },
            fileId: id,
            folderId,
            workspaceId,
          },
        });
        await updateFile({ bannerUrl: filePath }, id);
      }
    } catch (error) {}
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="flex flex-col gap-2"
    >
      <Label className="text-sm text-muted-foreground" htmlFor="banneImage">
        Banner Image
      </Label>
      <Input
        id="bannerImage"
        type="file"
        accept="image/*"
        disabled={isUploading}
        {...register("banner", { required: "Banner image is required" })}
      />
      <small className="text-red-600 ">
        {errors.banner?.message?.toString()}
      </small>
      <Button disabled={isUploading} type="submit">
        {!isUploading ? "Upload Banner" : <Loader />}
      </Button>
    </form>
  );
};

export default BannerUploadform;
