"use client";
import { useState, useEffect, useContext } from "react";
import Product from "./components/Product";
import Footer from "./components/Footer";
import { ProductsContext } from "./contexts/ProductsContext";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [input, setInput] = useState("");
  const [success, setSuccess] = useState(false);
  const[productsSearched, setProductsSearched] = useState([]);
  // const [cart, setCart] = useState([]);
  const { setSelectedProducts } = useContext(ProductsContext);
  const {cart, setCart} = useContext(ProductsContext);

  useEffect(() => {
    if(!success){
      router.push('/')
    }
    if (window.location.href.includes('success')) {
      setCart([]);
        setSuccess(true); 
        setTimeout(() => setSuccess(false), 5000);
    }

  }, [])

  const clearCart = async() => {
    console.log("clearing cart");
    
    try {
    const res = await fetch("/api/cart", {
      credentials: "include",
      method: 'DELETE'
    });
    if(res.ok){
      setCart([]);
    }      
    } catch (error) {
      console.log(error); 
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = '/api/products'
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
  // let productsSearched = [];

   const findSearchedProducts = async(input) => {
    try {
    // console.log(input);
    const url = `/api/products?search=${input}`

    const res = await fetch(url);
    if(res.ok){
      const searchedProducts = await res.json();
      setProducts(searchedProducts);
    } 
    } catch (error) {
      console.log(error);
    }
    // productsSearched = products.filter(product => product.name.toLowerCase().includes(input));
  }

  // if (input) {
  //   productsSearched = products.filter(product => product.name.toLowerCase().includes(input));
  // }
  // else {
    // productsSearched = products;
  // }

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
          <div className="md:w-full p-2 md:my-2 md:mx-7 flex justify-between gap-2 md:gap-0">
            <h2 className=" items-center font-artistic font-semibold text-2xl md:text-4xl text-purple-700">Suggestique</h2>
            <div className="md:mr-14 mb-2 flex justify-center items-center">
              <input className="text-xs md:text-sm" value={input} onChange={event => { setInput(event.target.value) }} placeholder="Search..." type="text"
                className="bg-gray-200 py-2 px-4 w-40 md:w-full rounded-xl shrink-0" />
              <button onClick={() => findSearchedProducts(input)} className="text-xs md:text-sm text-purple-800 font-bold absolute right-10 md:right-16">
             <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7C3AED"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div>
          {categoryNames.map(name => (
            <div key={name}>
              {products.find(product => product.category === name) && (
                <div>
                  <h2 className="text-2xl capitalize px-7 py-3">{refineText(name)}</h2>

                  <div className="flex overflow-x-scroll scrollbar-hide snap-x">
                    {products.filter(product => product.category === name).map(product => (
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
      <Footer cart={cart} position="fixed" />
    </div>
  );
};

