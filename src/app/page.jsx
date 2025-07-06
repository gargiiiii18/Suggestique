"use client";
import { useState, useEffect, useContext } from "react";
import Product from "./components/Product";
import Footer from "./components/Footer";
import { ProductsContext } from "./contexts/ProductsContext";

export default function Home() {

  const [products, setProducts] = useState([]);
  const [input, setInput] = useState("");
  const [success, setSuccess] = useState(false);
  const {setSelectedProducts} = useContext(ProductsContext);

  useEffect(() => {
    if(window.location.href.includes('success')){
      setSuccess(true);
      setSelectedProducts([]);
      
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    
    }
    
  }, [])

  useEffect(() => {
   const fetchProducts = async () => {
    try {
      const url = 'http://localhost:3000/api/products'
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log(error); 
    }
   }
   fetchProducts();
  }, [])
 
  const categoryNames = [...new Set(products.map(product => product.category))];
  let productsSearched=[];

  if(input){
    productsSearched = products.filter(product => product.name.toLowerCase().includes(input));
  }
  else{
    productsSearched = products;
  }
  
  return (
    <div>
  <div className="bg-purple-50 p-5 pb-10">
    {success && 
      <div className="bg-purple-300 p-4 mb-5 text-gray-700 text-lg rounded-xl">Thanks for shopping with us!</div>
    }
    <div className="border-b-2 border-gray-300">
    <div className="p-2 my-2 mx-7 flex justify-between ">
      <h2 className=" items-center font-artistic text-3xl text-purple-600">G-Shopp</h2>
      <div>
    <input value={input} onChange={event => {setInput(event.target.value)}} type="text" placeholder="search for items..." 
    className="bg-gray-200 py-2 px-4 rounded-xl shrink-0"/>
    <button>Search</button>
    </div>
    </div>
    </div>
    <div>
      {categoryNames.map(name => (
        <div key={name}>
        {  productsSearched.find(product => product.category === name) && (
        <div>
            <h2 className="text-2xl capitalize px-7 py-3">{name}</h2>

            <div className="flex overflow-x-scroll snap-x">
            {productsSearched.filter(product => product.category === name).map(product => (
            <div key={product._id} className="px-7 snap-start">
            <Product id={product._id} bgcolor={product.category} name={product.name} description={product.description} price={product.price} picture={product.picture}/>
            </div>
          ))}
            </div>
        </div>
         ) 
         } 
    
      </div>
    ))} 
    </div>
  </div>
  <Footer position="sticky"/>
  </div>
 );
};

