@@ .. @@
 import React, { useState } from 'react';
 import { Outlet, NavLink, useNavigate } from 'react-router-dom';
 import { Home, FileText, BarChart3, LogOut, Moon, Sun, User, Users } from 'lucide-react';
 import { useAuth } from '../contexts/AuthContext';
 import { useTheme } from '../contexts/ThemeContext';
+import OfflineIndicator from './OfflineIndicator';
 
 const Layout: React.FC = () => {
 }
@@ .. @@
   return (
     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
+      <OfflineIndicator />
+      
       {/* Sidebar */}
       <div
   )