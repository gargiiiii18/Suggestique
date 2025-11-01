import { NextAuthOptions }  from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { initMongoose } from "@/lib/mongoose";
import User from "@/models/User";

// interface Credentials {
//   email: string;
//   password: string;
// }

export const authOptions: NextAuthOptions = {

    providers: [
         CredentialsProvider({

    // id: "credentials",        
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) : Promise<{id: string; email: string} | null> {
      // Add logic here to look up the user from the credentials supplied
      await initMongoose();
      try {
        const user = await User.findOne({email: credentials?.email});

        if(!user){
            throw new Error('No user found with the provided email');
        }
        if(!credentials?.password){
          throw new Error("MIssing User password");
        }
        const isPwdCorrect = await bcrypt.compare(credentials?.password, user.password);
        if(isPwdCorrect){
            return user;
        } else{
            throw new Error("Incorrect Password");
        }

      } catch (error) {
        if(error instanceof Error){
        throw new Error(error.message);
        }
        throw new Error("An unknown error occurred");
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

