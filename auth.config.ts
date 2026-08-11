import type { NextAuthConfig } from "next-auth";

// Config "edge-safe": sem providers que dependam de Prisma/bcrypt,
// para poder ser usada dentro do middleware.
export const authConfig = {
  // Necessário quando a app roda atrás de um proxy/domínio próprio (Docker,
  // Nginx, etc.) — sem isso o Auth.js rejeita qualquer host que não seja
  // localhost. Ver AUTH_TRUST_HOST em https://errors.authjs.dev#untrustedhost
  trustHost: true,
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
