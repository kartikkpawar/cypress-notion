import React from "react";

interface TemplateProps {
  children: React.ReactNode;
}

const AuthTemplate: React.FC<TemplateProps> = ({ children }) => {
  return <div className="h-screen p-6 justify-center flex">{children}</div>;
};

export default AuthTemplate;
