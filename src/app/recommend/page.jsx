"use client"
import React, { useState } from 'react'
import Footer from "../components/Footer";
import Product from '../components/Product'

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

  const [recommendedProducts, setRecommendedProducts] = useState([]);
  let categories = '';
  // const btncolor = 'gray-300';

  const refineText = (str) => {
    return str.replace(/_/g, ' ').split(' ').map((word) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);

      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      // let topReco = refineText(data.top_recommendation);
      // console.log(topReco);

      setResult({
        top_recommendation: data.top_recommendation,
        confidence: data.confidence,
        top_3: data.top_3
      })
      // setCategory(data.)
      if (response.ok) {
        // console.log(result.top_3); 
        //  setFormData({
        //     occasion: '',
        //     country: '',
        //     gender: '',
        //     formality: '',
        //     context: ''
        // });
        // (data.top_3).map(cat => {
        //   categories = categories.join(cat[0], ',');
        // })
        // console.log(categories);

        getRecommendedProducts(data.top_recommendation);
        return data;
      } else {
        return "Failed";
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getRecommendedProducts = async (category) => {
    try {
      const url = `/api/products?categories=${category}`;
      console.log(url);

      const response = await fetch(url);

      if (response.ok) {
        const products = await response.json();
        setRecommendedProducts(products);
        console.log(products);
        return products;
      } else {
        setRecommendedProducts("There are no products based on the recommendation");
        return "Failed.";
      }

    } catch (error) {
      console.log(error);
    }
  }

  // const recommendationSystem = async(e) => {
  //   await handleSubmit(e);
  //   getRecommendedProducts();
  // }

  // console.log(recommendedProducts);

  return (
    <main className='mx-auto mb-20 pb-30 min-h-screen text-center bg-gradient'>
      <h1 className='p-8 text-4xl md:text-5xl font-artistic font-semibold text-purple-700'>Dress Recommender</h1>

      <form className='text-sm md:text-md mx-auto w-fit flex flex-col justify-center gap-4' onSubmit={handleSubmit} method='POST' action="/api/recommend">

        <div className='flex w-100 justify-between items-center gap-4'>
          <label className='text-left'>Occasion:</label>
          <input className='outline-none py-1 px-2 rounded-xl' type="text" name="occasion" value={formData.occasion} required onChange={(e) => { setFormData({ ...formData, occasion: e.target.value }) }} />
        </div>

        <div className='flex w-100 justify-between items-center gap-6'>
          <label className='text-left'>Country:</label>
          <input className='outline-none py-1 px-2 rounded-xl' type="text" name="country" value={formData.country} required onChange={(e) => { setFormData({ ...formData, country: e.target.value }) }} />
        </div>

        <div className='flex w-100 justify-between gap-8'>
          <label htmlFor="gender dropdown">Gender</label>
          <select onChange={(e) => { setFormData({ ...formData, gender: e.target.value }) }} className='outline-none py-1 px-2 rounded-xl' name="gender" id="gender">
            <option value="">Choose Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>

        <div className='flex w-100 justify-between gap-8'>
          <label htmlFor="formality dropdpwn">Formality (optional)</label>
          <select onChange={(e) => { setFormData({ ...formData, formality: e.target.value }) }} className='outline-none py-1 px-2 rounded-xl' name="formality" id="formality">
            <option value="">Choose Formality</option>
            <option value="formal">Formal</option>
            <option value="semi_formal">Semi Formal</option>
            <option value="casual">Casual</option>
          </select>
        </div>

        <div className='flex w-100 justify-between gap-8'>
          <label htmlFor="context dropdown">Cultural Context (optional)</label>
          <select onChange={(e) => { setFormData({ ...formData, context: e.target.value }) }} className='outline-none py-1 px-2 rounded-xl' name="context" id="context">
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
            <h1 className='text-xl'>Top Recommendation : <span className='font-bold text-purple-700'>{refineText(result.top_recommendation)}</span></h1>
            <h2 className='text-xl'>Confidence Level: <span className='text-lg'>{result.confidence}</span></h2>
          </div>
          <div>
            <h2 className='text-left my-2 ml-3 text-xl'>Top 3 Recommendations</h2>
            <div className='flex flex-col'>
              {
                (result.top_3).map((reco, index) => (
                  <h3 className='ml-3 text-xl text-left'>{index + 1}. {refineText(reco[0])}, Confidence level: {reco[1]}</h3>
                ))
              }
            </div>
          </div>
        </section>
      )
      }
      <section>
        {/* <h1 className='text-center text-purple-800 font-bold text-2xl'>Shop Now</h1> */}

        <div className='flex m-2 pb-10 gap-12 justify-center items-center h-full'>
          {recommendedProducts.map(product => (
            <Product id={product._id} btncolor='bg-white' name={product.name} description={product.description} price={product.price} picture={product.picture} />
          ))}
        </div>

      </section>
      <Footer />
    </main>
  )
}

export default page