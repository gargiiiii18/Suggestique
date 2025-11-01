'use client';
import {createContext, useEffect, useState, useMemo} from 'react';
import useLocalStorageState from 'use-local-storage-state';

export const ProductsContext = createContext({});

export const ProductsContextProvider = ({children}) => {

    const[selectedProducts, setSelectedProducts] = useLocalStorageState('cart', {defaultValue: []});

    const[cart, setCart] = useState([]);
    const[cartEmpty, setCartEmpty] = useState(false);

    useEffect(() => {
        const getUser = async() => {
            
            try {
              const response = await fetch('api/cart', {credentials: "include"}); 
              if(response.ok){
                const userCart = await response.json();
                setCart(userCart);
                if(userCart.length == 0){
                    setCartEmpty(true);
                }
                // console.log(userCart);
                // setCartEmpty(false);
              } 
            } catch (error) {
                console.log(error);
            }
        }
        getUser();
    }, []);

        // useEffect(() => {
        // console.log("cart effect triggered", cart);
        // const updateDb = async() => {
        // try {
        //     const response = await fetch('/api/cart',{
        //     method: 'POST',
        //     headers: {
        //         'Content-Type':'application/json'
        //     },
        //     body: JSON.stringify(cart),
        //     credentials: "include"
        //     })

        //     if(response.ok){
        //     const data = await response.json();
        //     // console.log(data);
        //     }
        // } 
        
        // catch (error) {
        //     console.log(error);
        // }
        // }
        // updateDb();
        // }, [cart]);
    // console.log(cart);

    return(
        <ProductsContext.Provider value={{selectedProducts, setSelectedProducts, cart, setCart, cartEmpty, setCartEmpty}}>
            {children}
        </ProductsContext.Provider>
    )
}

export const MessageContext = createContext({});

