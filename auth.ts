import NextAuth from "next-auth";
    import Credentials from "next-auth/providers/credentials";
    import { PrismaAdapter } from "@auth/prisma-adapter";
    import bcrypt from "bcryptjs";
    import { db } from "@/lib/db";
    import { z } from "zod";
    import { authConfig } from "./auth.config";
    
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });
    
    export const { handlers, auth, signIn, signOut } = NextAuth({
      ...authConfig,
      adapter: PrismaAdapter(db),
      session: { strategy: "jwt" },
      providers: [
        Credentials({
          async authorize(credentials) {import NextAuth from "next-auth";
    import Credentials from "next-auth/providers/credentials";
    import { PrismaAdapter } from "@auth/prisma-adapter";
    import bcrypt from "bcryptjs";
    import { db } from "@/lib/db";
    import { z } from "zod";
    import { authConfig } from "./auth.config";
    
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });
    
    export const { handlers, auth, signIn, signOut } = NextAuth({
      ...authConfig,
      adapter: PrismaAdapter(db),
      session: { strategy: "jwt" },
      providers: [
        Credentials({
          async authorize(credentials) {
            const parsed = loginSchema.safeParse(credentials);
            if (!parsed.success) return null;
    
            const { email, password } = parsed.data;
    
            const user = await db.user.findUnique({
              where: { email: email.toLowerCase() },
            });
    
            if (!user || !user.password) return null;
            if (!user.isActive) return null;
    
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return null;
    
            return {
               id: user.id,
               email: user.email,
               name: user.name,
               role: user.role
             };
          },
        }),
      ],
    });
            const parsed = loginSchema.safeParse(credentials);
            if (!parsed.success) return null;
            
            const { email, password } = parsed.data;
            
            const user = await db.user.findUnique({
              where: { email: email.toLowerCase() },
            });
            
            if (!user || !user.password) return null;
            if (!user.isActive) return null;
            
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return null;
            
            return { 
              id: user.id, 
              email: user.email, 
              name: user.name, 
              role: user.role 
            };
          },
        }),
      ],
    });
