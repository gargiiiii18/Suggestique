"use client";
import { useContext, useEffect, useState } from "react";
import {ProductsContext} from "../contexts/ProductsContext";
import { uptime } from "node:os";

const Product = (props) => {

  // const {setSelectedProducts} = useContext(ProductsContext);
  const {cart, setCart} = useContext(ProductsContext);
  // console.log(props);
  

  const btncolor = 'bg-purple-300';

  const backgroundColors = {
    mobiles: "bg-blue-200",
    audio: "bg-rose-200",
    laptop: "bg-amber-200",
}

// const addProducts = async(id) => {
//   // setSelectedProducts(prev => [...prev, id]);
//     setCart(prev => {
//     const existingItem = prev.find(item => item.productId === id);
//     console.log(existingItem);
//     let updatedCart;
//     if(existingItem){
//       updatedCart = prev.map(item => item.productId === id ? {...item, quantity: item.quantity+1 } : item);
//     } else{
//       console.log("adding new item");
//       updatedCart = [...prev, {productId: id, quantity: 1}];
//     }
//     syncCart(updatedCart);
//     return updatedCart
//   }
//   );
// }

const addProducts = async(id) => {
   setCart(prev => {
    const existingItem = prev.find(item => item.productId === id);
    // console.log(existingItem);
    if(existingItem){
      return prev.map(item => item.productId === id ? {...item, quantity: item.quantity+1 } : item);
    } else{
      // console.log("adding new item");
      return [...prev, {productId: id, quantity: 1}];
    }
   })
  const response = await fetch('/api/cart',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(id),
  });
  if(response.ok){
     const data = await response.json();
     console.log(data);
  } else{
    console.log("some error occured");
  }
}

// console.log(cart);

const bgcolor = backgroundColors[props.bgcolor] || "bg-white";

//  console.log(props.cart);
 

    return(
        <div className="h-30 md:h-50 py-4">
        <div className="w-64">
          <div className={`${bgcolor} flex justify-center items-center p-4 rounded-xl`}>
            <img className='h-40 md:h-48' src={props.picture} alt={props.name} />
          </div>
        
        <div className="mt-2">
        <h3 className="font-bold text-lg md:text-xl whitespace-nowrap overflow-scroll scrollbar-hide">{props.name}</h3>
        </div>
        <p className="text-xs md:text-sm mt-1 leading-4 text-gray-700 h-24 overflow-scroll scrollbar-hide">{props.description}</p>
        <div className="flex justify-between mt-2">
          <div className="text-xl md:text-2xl font-bold">₹{props.price}</div>
          <button onClick={() => {addProducts(props.id)}} className={`${props.btncolor} py-1 px-3 rounded-xl`}>+</button>
        </div>
      </div>
      </div>
    )
}

export default Product;