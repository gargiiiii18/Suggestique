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
  const [result, setResult] = useState({
    top_recommendation: '',
    confidence: null,
    top_3: [
      ['', null],
      ['', null],
      ['', null],
    ]
  })

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      console.log(formData);
      
      const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    setResult({
      top_recommendation : data.top_recommendation,
      confidence: data.confidence,
      top_3: data.top_3
    })
    if(response.ok){
      console.log(result.top_3); 
      return data;
    } else{
      return "Failed";
    }
    } catch (error) {
      console.log(error);
    }
  }

  

  return (
    <main className='mx-auto mb-20 pb-30 h-screen text-center bg-gradient'>
    <h1 className='p-8 text-5xl font-artistic font-semibold text-purple-700'>Dress Recommender</h1>

    <form className='mx-auto w-fit flex flex-col justify-around gap-4' onSubmit={handleSubmit} method='POST' action="/api/recommend">

        <div className='flex w-100 justify-between items-center gap-4'>
        <label className='text-left'>Occasion:</label>
        <input className='outline-none py-1 px-2 rounded-xl' type="text" name="occasion" value={formData.occasion} required onChange={(e) => {setFormData({...formData, occasion: e.target.value})}} />
        </div>

        <div className='flex w-100 justify-between items-center gap-6'>   
        <label className='text-left'>Country:</label>
        <input className='outline-none py-1 px-2 rounded-xl'  type="text" name="country" value={formData.country}  required onChange={(e) => {setFormData({...formData, country: e.target.value})}}/>
        </div>

        <div className='flex w-100 justify-between gap-8'>
          <label htmlFor="gender dropdown">Gender</label>
          <select onChange={(e) => {setFormData({...formData, gender: e.target.value})}} className='outline-none py-1 px-2 rounded-xl' name="gender" id="gender">
            <option value="">Choose Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>

        <div className='flex w-100 justify-between gap-8'>
          <label htmlFor="formality dropdpwn">Formality (optional)</label>
          <select onChange={(e) => {setFormData({...formData, formality: e.target.value})}} className='outline-none py-1 px-2 rounded-xl' name="formality" id="formality">
            <option value="">Choose Formality</option>
            <option value="formal">Formal</option>
            <option value="semi_formal">Semi Formal</option>
            <option value="casual">Casual</option>
          </select>
        </div>

        <div className='flex w-100 justify-between gap-8'>
          <label htmlFor="context dropdpwn">Cultural Context (optional)</label>
          <select onChange={(e) => {setFormData({...formData, context: e.target.value})}} className='outline-none py-1 px-2 rounded-xl' name="context" id="context">
            <option value="">Choose Cultural Context</option>
            <option value="relaxed">Relaxed</option>
            <option value="moderate">Moderate</option>
            <option value="conservative">Conservative</option>
          </select>
        </div>

        <button type='submit' className='mx-auto mt-4 rounded-full text-white bg-purple-500 shadow-sm shadow-purple-900 px-3 py-2 w-50'>Get Recommendation</button>
    </form>
    {result.confidence !== null && (
    <section className='mx-auto w-fit m-8 p-4 bg-white rounded-xl'>
      <h1 className='text-2xl mb-2 font-semibold text-purple-700'>Recommendations</h1>
      <div className='flex gap-8 m-3 justify-between'>
      <h1 className='text-xl'>Top Recommendation : <span className='font-bold text-purple-700'>{result.top_recommendation}</span></h1>
      <h2 className='text-xl'>Confidence Level: <span>{result.confidence}</span></h2>
        </div>
        <div>
      <h2 className='text-left my-2 ml-3 text-xl'>Top 3 Recommendations</h2>
      <div className='flex flex-col'>
      {
        (result.top_3).map((reco, index) => (
          <h3 className='ml-3 text-lg text-left'>{index+1}. {reco[0]}, Confidence level: {reco[1]}</h3>
        ))
      }
      </div>
      </div>
    </section>
     )
} 
<section>Browse such items on the website</section>
     <Footer/>
    </main>
  )
}

export default page