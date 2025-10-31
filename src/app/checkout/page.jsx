'use client';
import { useContext, useEffect, useState } from "react";
import Footer from "../components/Footer";
import { ProductsContext } from "../contexts/ProductsContext";

const Checkout = () => {
  // let uniqueIds = [];
  // const path = usePathname();
  const { selectedProducts, setSelectedProducts } = useContext(ProductsContext);
  const { cart, setCart } = useContext(ProductsContext);
  const [message, setMessage] = useState('');
  const [total, setTotal] = useState(0);
  const [selectedProductsInfo, setSelectedProductsInfo] = useState([]);
  const [isClicked, setClicked] = useState(false);
  // const [products, setProducts] = useState('');
  const [address, setAddress] = useState({
    area: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
  });
  const [email, setEmail] = useState("");
  // let uniqueIds = ''; 


  const handleSubmit = async (e) => {
    e.preventDefault();


    const info = {
      address,
      email,
      products: selectedProductsInfo.map(item => item._id).join(','),
    };
    console.log(info);

    try {
      const response = await fetch('/api/checkout', {
        credentials: "include",
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(info),
      });
      // console.log(body);

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
      // console.log(result);


    } catch (error) {
      console.log(error);
    }
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    })
    )
  }

  // console.log(selectedProductsInfo);


  useEffect(() => {
    const getSelectedProducts = async () => {
      // if (!selectedProducts || selectedProducts.length === 0) {
      //   return;
      // }
      try {

        const uniqueIds = [...new Set(cart.map(item => item.productId))];

        const url = `/api/products/?ids=${uniqueIds.join(',')}`;

        const response = await fetch(url);
        const data = await response.json();

        setSelectedProductsInfo(data);

        if (!cart.length) {

          setMessage("Your cart is empty");
        }

      } catch (error) {
        console.log(error);
        // setSelectedProductsInfo([]);
      }
    }
    getSelectedProducts();
  }, [cart]);

  console.log(selectedProductsInfo);


  useEffect(() => {

    const calculateTotal = async () => {
      // console.log("hey");
      if (selectedProductsInfo.length > 0) {
        let subtotal = 0;
        selectedProductsInfo.forEach(item => {
          console.log("inside foreach");

          const productPrice = Number(item.price);
          subtotal += productPrice;
          console.log(subtotal);

        })
        // for (let item of cart) {
        //   const productPrice = await cart.find(p => p._id === item.id).price || 0;
        //   console.log(productPrice);

        //   subtotal += productPrice;
        // }
        setTotal(subtotal);
      }
    }
    calculateTotal();
  }, [selectedProductsInfo, cart])


  // console.log(selectedProducts);



  const increaseProduct = async (id) => {
    // setSelectedProducts((prev) => [...prev, id]);
    // console.log(selectedProducts);
    setCart((prev) => {
      const itemToInc = prev.find(item => item.productId === id);
      if (itemToInc) {
        return prev.map(item => item.productId === id ? { ...item, quantity: item.quantity + 1 } : item);
      }
    });

    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ op: 'inc' }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        console.log("some error occured");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const decreaseProduct = async (id) => {
    setCart((prev) => {
      const itemToDec = prev.find(item => item.productId === id);
      if (itemToDec && itemToDec.quantity > 1) {
        return prev.map(item => (item.productId === id) ? { ...item, quantity: item.quantity - 1 } : item);
      } else {
        return prev.filter(item => (item.productId !== id));
      }
    })
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ op: 'dec' }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        console.log("some error occured");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getQty = (id) => {
    const product = cart.find(item => item.productId === id);
    if (product) {
      return product.quantity;
    }
    return 0;
  }

  // console.log(total);

  // console.log(selectedProductsInfo);

  const deliveryCharges = 150;

  const tax = 0.08 * total;
  const grandTotal = total + deliveryCharges + tax;

  //  console.log(selectedProducts.length); 

  return (
    <main className="min-h-screen flex flex-col">
      <main className="flex w-100 flex-col md:flex-row mt-8 gap-8 justify-around">
        {(message || selectedProducts.length==0) && (
        <div className={`w-full ${!message && "hidden"}`}>
          <h3 className="font-semibold text-lg text-center">{message}</h3>
          </div>
      )
      
      } 
        <section>
          {selectedProductsInfo.length > 0 &&

            selectedProductsInfo.map(product =>
            (
              <div key={product.id} className="w-961 mx-4 md:mx-6 flex mb-5">
                <div className="bg-gray-200 p-3 rounded-xl shrink-0">
                  <img className='w-24' src={product.picture} alt={product.name} />
                </div>
                {/* msin content */}
                <div className="pl-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <div>
                    <p className="text-sm leading-4 text-gray-700">{product.description}</p>
                  </div>

                  <div className="flex gap-10 items-center mt-2">
                    <div className="">₹{product.price}</div>
                    <div className="text-sm flex items-center gap-2">
                      <button onClick={() => decreaseProduct(product._id)} className="border border-purple-600 px-2 rounded-lg">-</button>
                      <span className="text-gray-700 px-2">Qty: <span>{getQty(product._id)}</span></span>
                      <button onClick={() => increaseProduct(product._id)} className="bg-purple-400 px-2 rounded-lg">+</button>
                    </div>
                  </div>
                </div>
              </div>
            )
            )
          }
        </section>
        <section className="">
          {cart.length > 0 && (

            <div id="summary-and-form">
              <div className="flex justify-center mb-4 pb-20">
                <div className="flex flex-col px-4 w-[25rem] sm:w-96 font-semibold text-lg">
                  <div className="flex justify-between">
                    <h3 className=" text-gray-700">Subtotal: </h3>
                    <h3>₹{total}</h3>
                  </div>
                  <div className="flex justify-evenly">
                    <h3 className="grow text-gray-700">Tax: </h3>
                    <h3>₹{tax}</h3>
                  </div>
                  <div className="flex justify-evenly">
                    <h3 className="grow text-gray-700">Delivery Charges: </h3>
                    <h3>₹{deliveryCharges}</h3>
                  </div>
                  <div className="flex justify-evenly border-t-2 pt-2 border-dashed border-gray-300">
                    <h3 className="grow text-gray-700">Grand Total: </h3>
                    <h3>₹{grandTotal}</h3>
                  </div>

                  <input name="products" type="hidden" value={selectedProducts.join(',')} />
                  {/* <Link className="flex justify-center items-center" href='/checkout'> */}
                  <button onClick={() => setClicked(!isClicked)} className="bg-purple-400 shadow-md shadow-purple-500 text-white m-8 py-2 px-3 rounded-xl font-medium">{!isClicked ? "Proceed" : "Back"}</button>
                  {/* </Link> */}

                  {(isClicked && cart.length > 0) &&
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3" action="/api/checkout/" method="POST">
                      <h3 className="pb-1 text-left text-gray-700 font-semibold text-lg">Address Details</h3>

                      <input className="bg-gray-200 px-2 py-1 rounded-lg" name="area" value={address.area} onChange={handleAddressChange} required="true" type="text" placeholder="building name, street, area" />
                      <input className="bg-gray-200 w-full px-2 py-1 rounded-lg" name="city" value={address.city} onChange={handleAddressChange} required="true" type="text" placeholder="city" />
                      <input className="bg-gray-200 w-full px-2 py-1 rounded-lg" name="state" value={address.state} onChange={handleAddressChange} required="true" type="text" placeholder="state" />
                      <input className="bg-gray-200 w-full px-2 py-1 rounded-lg" name="country" value={address.country} onChange={handleAddressChange} required="true" type="text" placeholder="country" />
                      <input className="bg-gray-200 w-full px-2 py-1 rounded-lg" name="zipcode" value={address.zipcode} onChange={handleAddressChange} required="true" type="number" placeholder="zip code" />
                      <input className="bg-gray-200 w-full px-2 py-1 rounded-lg" name="email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="email address" />
                      <button type="submit" className="bg-blue-400 shadow-md shadow-blue-500 text-white m-8 py-2 px-3 rounded-xl font-medium">Checkout</button>
                    </form>
                  }

                </div>
              </div>

              <div>
              </div>
            </div>

          )
          }
        </section>


      </main>
      <Footer position='' />
    </main>

  )
}


export default Checkout
