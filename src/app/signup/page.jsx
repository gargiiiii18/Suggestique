"use client"
import { useState } from 'react';

const page = () => {

     const [formData, setFormData] = useState({
        email: '',
        password: '',
        address: {
            area: '',
            city: '',
            state: '',
            country: '',
            zipcode: '',
        },
      });
    
      console.log(formData);
      

  return (
    <section>
        <h1>Signup</h1>
        <form className='mx-auto w-fit flex flex-col justify-around gap-4' method='POST' action="">


        <div className='flex flex-col w-100 justify-between items-center gap-6'>   
            <div className='flex w-100 justify-between items-center gap-4'>
        <label className='text-left'>Email</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="text" name="email" value={formData.email} required onChange={(e) => {setFormData({...formData, email: e.target.value})}} />
        </div> 
        <label className='text-left'>Address Details:</label>
                <input className="bg-gray-200 px-2 py-1 rounded-lg" name="area" value={formData.address.area} onChange={(e) => {setFormData({...formData, area: e.target.value})}} type="text" placeholder="building name, street, area" />
                <input className="bg-gray-200 w-full px-2 py-1 rounded-lg" name="city" value={formData.address.city} onChange={(e) => {setFormData({...formData, city: e.target.value})}} type="text" placeholder="city" />
                <input className="bg-gray-200 w-full px-2 py-1 rounded-lg" name="state" value={formData.address.state} onChange={(e) => {setFormData({...formData, state: e.target.value})}} type="text" placeholder="state" />
                <input className="bg-gray-200 w-full px-2 py-1 rounded-lg" name="country" value={formData.address.country} onChange={(e) => {setFormData({...formData, country: e.target.value})}} type="text" placeholder="country" />
                <input className="bg-gray-200 w-full px-2 py-1 rounded-lg" name="zipcode" value={formData.address.zipcode} onChange={(e) => {setFormData({...formData, city: e.target.value})}} type="number" placeholder="zip code" />
        <div className='flex w-100 justify-between items-center gap-4'>
        <label className='text-left'>Password</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="text" name="email" value={formData.password} required onChange={(e) => {setFormData({...formData, password: e.target.value})}} />
        </div>        
        </div>
        <button type='submit' className='mx-auto mt-4 rounded-full text-white bg-purple-500 shadow-sm shadow-purple-900 px-3 py-2 w-50'>Sign Up</button>
    </form>
    </section>
  )
}

export default page