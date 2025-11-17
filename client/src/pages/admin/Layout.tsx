import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Loading from "../../components/Loading";
import { useAppContext } from "../../context/AppContext";

export default function Layout() {
  const { isAdmin, fetchIsAdmin } = useAppContext();

  // Fetch admin status ONCE on mount
  useEffect(() => {
    fetchIsAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Still loading admin status
  if (isAdmin === false) {
    return <Loading />;
  }

  // If user is NOT admin → Redirect
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
}
