"use client"
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const page = () => {

  const [userData, setUserData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    address: {
      area: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
    },
  });

  const handleSubmit = async(e) => {
    e.preventDefault();
    if(userData.password != userData.confirmPassword){
      toast.error('Passwords do not match');
      return;
    }
      try {
      const response = await fetch("/api/users/signup", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      console.log(data);
      toast.success(data.message);
      } catch (error) {
        console.log(error);
      }

  }

  const notify = () => toast('Here is your toast.');

  return (
    <section className='mx-auto mb-20 pb-30 min-h-screen'>

      

      <h1 className='p-8 text-5xl text-purple-600 text-center font-artistic font-semibold'>Signup</h1>

      <form className='mx-auto w-fit flex flex-col justify-around gap-4' onSubmit={handleSubmit} method='POST' action="">
        <Toaster/>
          <div className='flex w-100 justify-between items-center gap-14'>        
            <label className='text-left text-lg text-purple-700 font-semibold'>Email</label>
            <input className="bg-gray-200 px-2 py-1 rounded-lg" placeholder='email' required type="text" name="email" value={userData.email} onChange={(e) => { setUserData({ ...userData, email: e.target.value }) }} />
          </div>
          
          <h2 className='text-left text-lg text-purple-700 font-semibold'>Address Details</h2>
         
           <div className='flex w-100 justify-between items-center gap-14'>
             <label className='text-left'>Building, Area, Street</label>
          <input className="bg-gray-200 px-2 py-1 rounded-lg" name="area" required value={userData.address.area} onChange={(e) => { setUserData({ ...userData, address: {...userData.address, area: e.target.value}}) }} type="text" placeholder="building name, street, area" />
          </div>

          <div className='flex w-100 justify-between items-center gap-14'>
             <label className='text-left'>City</label>
          <input className="bg-gray-200  px-2 py-1 rounded-lg" name="city" required value={userData.address.city} onChange={(e) => { setUserData({ ...userData, address: {...userData.address,  city: e.target.value }}) }} type="text" placeholder="city" />
          </div>

          <div className='flex w-100 justify-between items-center gap-14'>
             <label className='text-left'>State</label>
          <input className="bg-gray-200 px-2 py-1 rounded-lg" name="state" required value={userData.address.state} onChange={(e) => { setUserData({ ...userData, address: {...userData.address, state: e.target.value }}) }} type="text" placeholder="state" />
          </div>

          <div className='flex w-100 justify-between items-center gap-14'>
             <label className='text-left'>Country</label>
          <input className="bg-gray-200 px-2 py-1 rounded-lg" name="country" required value={userData.address.country} onChange={(e) => { setUserData({ ...userData, address: {...userData.address,  country: e.target.value}}) }} type="text" placeholder="country" />
          </div>

          <div className='flex w-100 justify-between items-center gap-14'>
            <label className='text-left'>Zipcode</label>
          <input className="bg-gray-200 px-2 py-1 rounded-lg" name="zipcode" required value={userData.address.zipcode} onChange={(e) => {setUserData({ ...userData, address: {...userData.address, zipcode: e.target.value} }) }} type="number" placeholder="zip code" />
          </div>

          <div className='flex w-100 justify-between items-center gap-14'>
            <label className='text-left text-lg text-purple-700 font-semibold'>Password</label>
            <input className="bg-gray-200 px-2 py-1 rounded-lg" placeholder='password' type="text" name="password" value={userData.password} required onChange={(e) => { setUserData({ ...userData, password: e.target.value }) }} />
          </div>

          <div className='flex w-100 justify-between items-center gap-14'>
            <label className='text-left text-lg text-purple-700 font-semibold'>Confirm Password</label>
            <input className="bg-gray-200 px-2 py-1 rounded-lg" placeholder='confirm password' type="text" name="confirm password" value={userData.confirmPassword} required onChange={(e) => { setUserData({ ...userData, confirmPassword: e.target.value }) }} />
          </div>

        <button type='submit' className='mx-auto w-40 mt-4 rounded-full text-white bg-purple-500 shadow-sm shadow-purple-900 px-6 py-2 w-50'>Sign Up</button>
      </form>
    </section>
  )
}

export default page