"use client"
import React, { useState } from 'react'
import Footer from "../components/Footer";
import { set } from 'mongoose';

const page = () => {

  const [formData, setFormData] = useState({
    occasion: '',
    country: '',
    gender: '',
    formality: '',
    context: ''
  });

  const handleTextChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      prev,
      [name]: value,
    })
  )
  }

  // const handleSubmit = () => {
  //   setFormData(() => {
  //     const {name, value} = event.target;
      
  //   })
  // }

  console.log(formData);
  

  return (
    <main className='mx-auto h-screen text-center bg-gradient'>
    <h1 className='p-8 text-5xl font-artistic font-semibold text-purple-700'>Dress Recommender</h1>

    <form className='mx-auto w-fit flex flex-col justify-around gap-4' method='POST' action="/api/recommend">

        <div className='flex w-100 items-center gap-4'>
        <label className='text-left'>Occasion:</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="text" name="occasion" value={formData.occasion} required onChange={handleTextChange} />
        </div>

        <div className='flex w-100 items-center gap-6'>   
        <label className='text-left'>Country:</label>
        <input className='outline-none py-1 px-2 rounded-xl'  type="text" name="country" value={formData.country}  required onChange={handleTextChange}/>
        </div>

        <div className='flex w-fit justify-center gap-3'>
        <label className='text-left'>Gender:</label>
        <div className='flex flex-col justify-evenly'>
        <div className='flex justify-between items-center gap-3'>
        <label className='text-left'>Male:</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="radio" name="gender" value={formData.gender} onChange={handleTextChange}/>
        </div>
        <div className='flex justify-between items-center gap-3'>
        <label className='text-left'>Female:</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="radio" name="gender" value={formData.gender} onChange={handleTextChange}/>
        </div>
        <div className='flex justify-between items-center gap-3'>
        <label className='text-left'>Unisex:</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="radio" name="gender" value={formData.gender} onChange={handleTextChange}/>
        </div>
        </div>
        </div>

        <div className='flex w-fit justify-center gap-4'>
        <label className='text-left'>Formality (optional):</label>
        <div className='flex flex-col justify-evenly'>
        <div className='flex justify-between items-center gap-3'>
        <label className='text-left'>Formal:</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="radio" name="formality" value="formal"/>
        </div>
        <div className='flex justify-between items-center gap-3'>
        <label className='text-left'>Semi Formal:</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="radio" name="formality" value="semi_formal"/>
        </div>
        <div className='flex justify-between items-center gap-3'>
        <label className='text-left'>Casual:</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="radio" name="formality" value="casual"/>
        </div>
        </div>
        </div>

        <div className='flex w-fit justify-center gap-4'>
        <label className='text-left'>Cultural Context (optional):</label>
        <div className='flex flex-col justify-evenly'>
        <div className='flex justify-between items-center gap-3'>
        <label className='text-left'>Relaxed:</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="radio" name="context" value="relaxed"/>
        </div>
        <div className='flex justify-between items-center gap-3'>
        <label className='text-left'>Moderate:</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="radio" name="context" value="moderate"/>
        </div>
        <div className='flex justify-between items-center gap-3'>
        <label className='text-left'>Conservative:</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="radio" name="context" value="conservative"/>
        </div>
        </div>
        </div>

        <button type='submit' className='mx-auto mt-4 rounded-full text-white bg-purple-500 shadow-sm shadow-purple-900 px-3 py-2 w-50'>Get Recommendation</button>
    </form>
    <Footer/>
    </main>
  )
}

export default page