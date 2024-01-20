export const dynamic = "force-dynamic";

import QuillEditor from "@/components/quillEditor/QuillEditor";
import { getFileDetails, getWorkspaceDetails } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import React from "react";

const Workspace = async ({ params }: { params: { fileId: string } }) => {
  const { data, error } = await getFileDetails(params.fileId);
  if (error || !data.length) redirect("/dashboard");
  return (
    <div className="relative">
      <QuillEditor
        dirType="workspace"
        fileId={params.fileId}
        dirDetails={data[0] || {}}
      />
    </div>
  );
};

export default Workspace;
