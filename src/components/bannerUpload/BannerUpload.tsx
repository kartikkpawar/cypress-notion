import React from "react";
import CustomDialogTrigger from "../global/CustomDialogTrigger";
import BannerUploadform from "./BannerUploadform";

interface BannerUploadProps {
  children: React.ReactNode;
  className?: string;
  dirType: "workspace" | "file" | "folder";
  id: string;
}

const BannerUpload: React.FC<BannerUploadProps> = ({
  id,
  dirType,
  children,
  className,
}) => {
  return (
    <CustomDialogTrigger
      header="Upload Banner"
      content={<BannerUploadform dirType={dirType} id={id} key={id} />}
      className={className}
    >
      {children}
    </CustomDialogTrigger>
  );
};

export default BannerUpload;
