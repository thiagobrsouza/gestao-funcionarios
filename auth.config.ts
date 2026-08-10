import type { NextAuthConfig } from "next-auth";

// Config "edge-safe": sem providers que dependam de Prisma/bcrypt,
// para poder ser usada dentro do middleware.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = request.nextUrl.pathname.startsWith("/login");

      if (isLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", request.nextUrl));
        return true;
      }

      // false aqui faz o NextAuth redirecionar automaticamente para /login
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
