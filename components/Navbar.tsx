"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const links = [
  { href: "/cargos", label: "Cargos" },
  { href: "/departamentos", label: "Departamentos" },
  { href: "/funcionarios", label: "Funcionários" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === "/login") return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-8">
        <span className="font-bold text-gray-900">Gestão de Funcionários</span>
        <div className="flex gap-6">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "text-sm font-semibold text-blue-600"
                    : "text-sm text-gray-600 hover:text-blue-600"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-4">
          {session?.user?.name && (
            <span className="text-sm text-gray-500">{session.user.name}</span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-red-600 hover:underline"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
