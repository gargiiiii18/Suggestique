"use client";
import { useState, useEffect, useContext } from "react";
import Product from "./components/Product";
import Footer from "./components/Footer";
import { ProductsContext } from "./contexts/ProductsContext";
import { signIn } from "next-auth/react";

export default function Home() {

  const [products, setProducts] = useState([]);
  const [input, setInput] = useState("");
  const [success, setSuccess] = useState(false);
  // const [cart, setCart] = useState([]);
  const { setSelectedProducts } = useContext(ProductsContext);
  const {cart, setCart} = useContext(ProductsContext);

  useEffect(() => {
    if (window.location.href.includes('success')) {
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

//   useEffect(() => {
//   console.log("cart effect triggered", cart);
//   const updateDb = async() => {
// try {
//     const response = await fetch('/api/cart',{
//       method: 'POST',
//       headers: {
//         'Content-Type':'application/json'
//       },
//       body: JSON.stringify(cart),
//       credentials: "include"
//     })

//     if(response.ok){
//       const data = await response.json();
//       console.log(data);
//     }
//   } 
  
//   catch (error) {
//     console.log(error);
//   }
//   }

// updateDb();
// }, [cart]);

  const categoryNames = [...new Set(products.map(product => product.category))];
  let productsSearched = [];

  if (input) {
    productsSearched = products.filter(product => product.name.toLowerCase().includes(input));
  }
  else {
    productsSearched = products;
  }

  const refineText = (str) => {
    return str.replace(/_/g, ' ').split(' ').map((word) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  return (
    <div>
      <div className="p-5 pb-10">
        {success &&
          <div className="bg-purple-300 p-4 mb-5 text-gray-700 text-lg rounded-xl">Thanks for shopping with us!</div>
        }
        <div className="border-b-2 border-gray-300">
          <div className="p-2 my-2 mx-7 flex justify-between ">
            <h2 className=" items-center font-artistic font-semibold text-4xl text-purple-700">Suggestique</h2>
            <div className="flex justify-center items-center">
              <input value={input} onChange={event => { setInput(event.target.value) }} type="text" placeholder="search for items..."
                className="bg-gray-200 py-2 px-4 w-full rounded-xl shrink-0" />
              <button className="text-sm text-purple-800 font-bold absolute right-16">Search</button>
            </div>
          </div>
        </div>
        <div>
          {categoryNames.map(name => (
            <div key={name}>
              {productsSearched.find(product => product.category === name) && (
                <div>
                  <h2 className="text-2xl capitalize px-7 py-3">{refineText(name)}</h2>

                  <div className="flex overflow-x-scroll scrollbar-hide snap-x">
                    {productsSearched.filter(product => product.category === name).map(product => (
                      <div key={product._id} className="px-7 snap-start">
                        <Product cart={cart} setCart={setCart} id={product._id} btncolor='bg-purple-300' bgcolor={product.category} name={product.name} description={product.description} price={product.price} picture={product.picture} />
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
      <Footer cart={cart} position="sticky" />
    </div>
  );
};

