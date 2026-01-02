import type { LucideIcon } from "lucide-react";
import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, PlusSquareIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";

interface AdminNavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

const admin = {
  name: "Admin User",
  avatar: assets.profile,
};

const navItems: AdminNavItem[] = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboardIcon },
  { name: "Add Shows", path: "/admin/add-shows", icon: PlusSquareIcon },
  { name: "List Shows", path: "/admin/list-shows", icon: ListIcon },
  { name: "List Bookings", path: "/admin/list-bookings", icon: ListCollapseIcon },
];

export default function AdminSidebar() {
  return (
    <aside className="h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-gray-300/20 text-sm">
      <img
        src={admin.avatar}
        alt="Admin avatar"
        className="h-9 w-9 md:h-14 md:w-14 rounded-full mx-auto"
      />

      <p className="mt-2 text-base max-md:hidden">{admin.name}</p>

      <div className="w-full mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              [
                "relative flex items-center max-md:justify-center gap-2 w-full py-2.5 md:pl-10 text-gray-400",
                isActive ? "bg-primary/15 text-primary" : "",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="size-5" />
                <span className="max-md:hidden">{item.name}</span>

                <span
                  className={`absolute right-0 w-1.5 h-10 rounded-l ${
                    isActive ? "bg-primary" : ""
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
