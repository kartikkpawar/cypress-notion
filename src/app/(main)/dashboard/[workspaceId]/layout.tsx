import Sidebar from "@/components/sidebar/Sidebar";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const Layout: React.FC<LayoutProps> = ({ children, params }) => {
  return (
    <main className="flex overflow-hidden h-screen w-screen">
      <Sidebar params={params} />
      <div className="dark:border-neutrals-12/70 border-l-[1px] w-full relative overflow-scroll">
        {children}
      </div>
    </main>
  );
};

export default Layout;
