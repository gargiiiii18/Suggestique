"use client";
import { useContext } from "react";
import {ProductsContext} from "../contexts/ProductsContext";

const Product = (props) => {

  const {setSelectedProducts} = useContext(ProductsContext);

  const backgroundColors = {
    mobiles: "bg-blue-200",
    audio: "bg-rose-200",
    laptop: "bg-amber-200",
}

const addProducts = (id) => {
  setSelectedProducts(prev => [...prev, id]);
  console.log(id);
  
}

const bgcolor = backgroundColors[props.bgcolor] || "bg-pink-200";

 

    return(
        <div className="py-4">
        <div className="w-64">
          <div className={`${bgcolor} p-4 rounded-xl`}>
            <img className='' src={props.picture} alt="iphone" />
          </div>
        
        <div className="mt-2">
        <h3 className="font-bold text-xl">{props.name}</h3>
        </div>
        <p className="text-sm mt-1 leading-4 text-gray-700">{props.description}</p>
        <div className=" flex justify-between mt-2">
          <div className="text-2xl font-bold">${props.price}</div>
          <button onClick={() => {addProducts(props.id)}} className="bg-purple-300 py-1 px-3 rounded-xl">+</button>
        </div>
      </div>
      </div>
    )
}

export default Product;