import React from 'react';
import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main>{children}</main>
  </div>
);

export default Layout;
