import NextAuth, { NextAuthConfig }  from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs";
import { initMongoose } from "@/lib/mongoose";
import User from "@/models/User";

export const authOptions: NextAuthConfig = {

    providers: [
         CredentialsProvider({

    // id: "credentials",        
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials: any) : Promise<any> {
      // Add logic here to look up the user from the credentials supplied
      await initMongoose();
      try {
        const user = await User.findOne({email: credentials.email});

        if(!user){
            throw new Error('No user found with the provided email');
        }
        const isPwdCorrect = await bcrypt.compare(credentials.password, user.password);
        if(isPwdCorrect){
            return user;
        } else{
            throw new Error("Incorrect Password");
        }

      } catch (error: any) {
        throw new Error(error);
      }
    }
    })
    ],
    callbacks: {
    async jwt({ token, user }) {
      if(user){
        token._id = user._id?.toString();
        token.email = user.email;
      }  
      return token
    },
        async session({ session, token }) {
        if(token){
            session.user._id = token._id as string | undefined;
            session.user.email = token.email as string;
        }
      return session
    }
    },
    pages: {
        signIn: '/signin'
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
    theme: {
        colorScheme: 'light',
        brandColor: '#7e22ce',
    }

}

