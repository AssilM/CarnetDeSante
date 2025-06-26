import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">{children}</div>
  );
};

export default AuthLayout;
