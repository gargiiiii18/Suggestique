"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react";
import Link from "next/link";

export default function Component() {
  const { data: session } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    })

    console.log(result);
  }


  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      {/* Not signed in <br />
      <button className="bg-purple-600 text-white py-2 rounded-lg px-6" onClick={() => signIn()}>Sign in</button> */}
      <section className='mx-auto px-14 mb-20 pb-30 min-h-screen'>

        <h1 className='p-8 text-4xl md:text-5xl text-purple-600 text-center font-artistic font-semibold'>SignIn</h1>
        <form className='mx-auto w-fit flex flex-col justify-center gap-4' onSubmit={handleSubmit} method='POST' action="">

          <div className='flex w-100 justify-between items-center gap-14'>
            <label className='text-left md:text-lg text-sm'>Email</label>
            <input className="bg-gray-200 px-2 py-1 md:text-lg text-sm rounded-lg" placeholder='email' required type="text" name="email" value={email} onChange={(e) => { setEmail(e.target.value) }} />
          </div>

          <div className='flex w-100 justify-between items-center gap-14'>
            <label className='text-left md:text-lg text-sm'>Password</label>
            <input className="bg-gray-200 px-2 py-1 md:text-lg text-sm rounded-lg" name="area" required value={password} onChange={(e) => { setPassword(e.target.value) }} type="password" placeholder="password" />
          </div>

          <button type='submit' className='mx-auto w-24 md:w-40 mt-4 rounded-full md:text-lg text-sm text-white bg-purple-500 shadow-sm shadow-purple-900 py-1 md:px-6 md:py-2 md:w-50'>Sign In</button>
        </form>
        <h3 className="text-center md:text-lg text-sm text-gray-500 font-semibold p-6">Don't have an account? <Link className="text-purple-700" href='/signup'> Signup</Link></h3>
      </section>
    </>
  )
}