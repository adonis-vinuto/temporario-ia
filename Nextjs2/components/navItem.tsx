import { LucideIcon } from "lucide-react";
import Link from "next/link";

export default function NavItem({
  label,
  Icon,
  link,
  active,
  collapsed,
}: Readonly<{
  label: string;
  link: string;
  Icon: LucideIcon;
  active?: boolean;
  collapsed?: boolean;
}>) {
  return (
    <Link href={link}>
      <div
        className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-md cursor-pointer ${
          active
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent text-accent-foreground"
        }`}
      >
        <span className={collapsed ? 'mx-auto' : ''}>
          <Icon />
        </span>
        {!collapsed && <span>{label}</span>}
      </div>
    </Link>
  );
}
