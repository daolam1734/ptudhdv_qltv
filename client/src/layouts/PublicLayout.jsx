import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;

