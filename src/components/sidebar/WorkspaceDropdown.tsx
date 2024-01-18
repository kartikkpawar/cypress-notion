"use client";
import { useAppState } from "@/lib/providers/SateProvider";
import { Workspace } from "@/lib/supabase/supabase.types";
import React, { Fragment, useEffect, useState } from "react";
import SelectedWorkspace from "./SelectedWorkspace";
import { optional } from "zod";
import CustomDialogTrigger from "../global/CustomDialogTrigger";
import WorkspaceCreater from "../global/WorkspaceCreater";

interface WorkspaceDropdownProps {
  privateWorkspaces: Workspace[] | [];
  collaboratingWorkspaces: Workspace[] | [];
  sharedWorkspaces: Workspace[] | [];
  defaultValue: Workspace | undefined;
}

const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({
  privateWorkspaces,
  collaboratingWorkspaces,
  sharedWorkspaces,
  defaultValue,
}) => {
  const { dispatch, state } = useAppState();

  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!state.workspaces.length) {
      dispatch({
        type: "SET_WORKSPACES",
        payload: {
          workspaces: [
            ...privateWorkspaces,
            ...sharedWorkspaces,
            ...collaboratingWorkspaces,
          ].map((workspace) => ({ ...workspace, folders: [] })),
        },
      });
    }
  }, [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces]);

  const handleSelect = (option: Workspace) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div className="">
        <span onClick={() => setIsOpen(!isOpen)}>
          {selectedOption ? (
            <SelectedWorkspace workspace={selectedOption} />
          ) : (
            "Select a workspace"
          )}
        </span>
      </div>
      {isOpen && (
        <div className="origin-top-right absolute w-full rounded-md shadow-md z-50 h-[190px] bg-black/10 backdrop-blur-lg group overflow-scroll border-[1px] border-muted">
          <div className="rounded-md flex flex-col">
            <div className="!p-2">
              {!!privateWorkspaces.length && (
                <Fragment>
                  <p className="text-muted-foreground">Private</p>
                  <hr />
                  {privateWorkspaces.map((option) => (
                    <SelectedWorkspace
                      workspace={option}
                      key={option.id}
                      onClick={handleSelect}
                    />
                  ))}
                </Fragment>
              )}
            </div>
            <div className="!p-2">
              {!!sharedWorkspaces.length && (
                <Fragment>
                  <p className="text-muted-foreground">Private</p>
                  <hr />
                  {privateWorkspaces.map((option) => (
                    <SelectedWorkspace
                      workspace={option}
                      key={option.id}
                      onClick={handleSelect}
                    />
                  ))}
                </Fragment>
              )}
            </div>
            <div className="!p-2">
              {!!collaboratingWorkspaces.length && (
                <Fragment>
                  <p className="text-muted-foreground">Private</p>
                  <hr />
                  {privateWorkspaces.map((option) => (
                    <SelectedWorkspace
                      workspace={option}
                      key={option.id}
                      onClick={handleSelect}
                    />
                  ))}
                </Fragment>
              )}
            </div>
            <CustomDialogTrigger
              header="Create a workspace"
              content={<WorkspaceCreater />}
              description="Workspaces give you the power to collborate with other. You can change your workspace privacy settings after creatting the workspace too."
            >
              <div className="flex transition-all hover:bg-muted justify-center items-center gap-2 p-2 w-full">
                <article className="text-slate-500 rounded-full bg-slate-800  w-4  h-4  flex  items-center  justify-center">
                  +
                </article>
                Create workspace
              </div>
            </CustomDialogTrigger>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDropdown;
