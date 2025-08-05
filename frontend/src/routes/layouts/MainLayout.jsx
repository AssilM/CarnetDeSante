import React from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { ScrollToTop } from "../../components/patient/common";
import Notification from "../../components/Notification";

const MainLayout = ({ children, hideFooter = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ScrollToTop />
      <Navbar />
      <Notification />
      <div className="flex-1 flex">
        <Sidebar />
        <main
          className={`flex-1 w-full mt-16 ${
            hideFooter ? "h-[calc(100vh-4rem)]" : "min-h-[calc(100vh-4rem)]"
          }`}
        >
          {children}
        </main>
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
