import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Award, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';

const CheckoutForm = () => {
  const {
    user,
    token,
    cart,
    getTotal,
    getSubtotal,
    getDiscountAmount,
    clearCart,
    addAddress,
    addNotification,
    fetchUserProfile,
    backendUrl,
    formatPrice
  } = useApp();

  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment Selector, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Shipping Address fields
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('India');

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod' | 'wallet'
  const [walletUsed, setWalletUsed] = useState(0);

  // Razorpay order info
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [showMockModal, setShowMockModal] = useState(false);

  useEffect(() => {
    if (cart.length === 0 && step !== 3) {
      navigate('/');
    }
  }, [cart, step, navigate]);

  // Load Razorpay SDK Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceedToPayment = async () => {
    if (!user || user.shippingAddresses.length === 0) {
      if (!street || !city || !state || !zip || !country) {
        addNotification('Please enter a shipping address.', 'warning');
        return;
      }
      setLoading(true);
      const success = await addAddress({ street, city, state, zip, country, isDefault: true });
      setLoading(false);
      if (!success) return;
    }
    setStep(2);
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await addAddress({ street, city, state, zip, country, isDefault: false });
    setLoading(false);
    if (success) {
      setShowAddressForm(false);
      setStreet('');
      setCity('');
      setState('');
      setZip('');
      setSelectedAddressIndex(user.shippingAddresses.length);
    }
  };

  // Triggers order creation
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const activeAddress = user.shippingAddresses[selectedAddressIndex] || {
      street, city, state, zip, country
    };

    const payableAmount = Math.max(0, getTotal() - walletUsed);

    // Call create order endpoint
    try {
      const orderItems = cart.map(item => ({
        productId: item.productId._id,
        title: item.productId.title,
        price: item.productId.price,
        quantity: item.quantity
      }));

      // Wallet payment shortcut
      if (paymentMethod === 'wallet') {
        if ((user?.walletBalance || 0) < getTotal()) {
          addNotification('Insufficient wallet balance!', 'error');
          setLoading(false);
          return;
        }
        // Place order directly
        const response = await fetch(`${backendUrl}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            items: orderItems,
            paymentIntentId: `wallet_tx_${Date.now()}`,
            paymentStatus: 'paid',
            totalAmount: getTotal(),
            walletUsed: getTotal(),
            shippingAddress: activeAddress
          })
        });
        const data = await response.json();
        if (response.ok) {
          completeOrderSuccess(data._id);
        } else {
          addNotification(data.message || 'Failed to place wallet order', 'error');
        }
        setLoading(false);
        return;
      }

      // Cash on Delivery
      if (paymentMethod === 'cod') {
        const response = await fetch(`${backendUrl}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            items: orderItems,
            paymentIntentId: `cod_pending_${Date.now()}`,
            paymentStatus: 'pending',
            totalAmount: payableAmount,
            walletUsed,
            shippingAddress: activeAddress
          })
        });
        const data = await response.json();
        if (response.ok) {
          completeOrderSuccess(data._id);
        } else {
          addNotification(data.message || 'Failed to log COD order', 'error');
        }
        setLoading(false);
        return;
      }

      // Razorpay payment path
      const response = await fetch(`${backendUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: payableAmount })
      });

      const data = await response.json();
      if (!response.ok) {
        addNotification(data.message || 'Razorpay order creation failed', 'error');
        setLoading(false);
        return;
      }

      setRazorpayOrder(data);

      if (data.isMock) {
        // Trigger simulated popup modal
        setShowMockModal(true);
        setLoading(false);
      } else {
        // Load official SDK
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          addNotification('Razorpay SDK failed to load. Falling back to sandbox simulator.', 'warning');
          setShowMockModal(true);
          setLoading(false);
          return;
        }

        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: 'NexaCart Shopping',
          description: 'Secure Order Payment',
          order_id: data.id,
          handler: async function (response) {
            // Verify payment
            const verifyRes = await fetch(`${backendUrl}/api/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyRes.ok) {
              // Create backend order
              const finalOrderRes = await fetch(`${backendUrl}/api/orders`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  items: orderItems,
                  paymentIntentId: response.razorpay_payment_id,
                  paymentStatus: 'paid',
                  totalAmount: payableAmount,
                  walletUsed,
                  shippingAddress: activeAddress
                })
              });
              const finalOrder = await finalOrderRes.json();
              if (finalOrderRes.ok) {
                completeOrderSuccess(finalOrder._id);
              } else {
                addNotification('Payment verified but order creation failed!', 'error');
              }
            } else {
              addNotification('Signature verification failed', 'error');
            }
          },
          prefill: {
            name: user.name,
            email: user.email
          },
          theme: {
            color: '#2563EB'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      addNotification('Could not connect to payment gateway', 'error');
      setLoading(false);
    }
  };

  // Mock payment approval
  const handleApproveMockPayment = async () => {
    setShowMockModal(false);
    setLoading(true);

    const activeAddress = user.shippingAddresses[selectedAddressIndex] || {
      street, city, state, zip, country
    };
    const payableAmount = Math.max(0, getTotal() - walletUsed);
    const orderItems = cart.map(item => ({
      productId: item.productId._id,
      title: item.productId.title,
      price: item.productId.price,
      quantity: item.quantity
    }));

    try {
      const finalOrderRes = await fetch(`${backendUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          paymentIntentId: `mock_rzp_tx_${Date.now()}`,
          paymentStatus: 'paid',
          totalAmount: payableAmount,
          walletUsed,
          shippingAddress: activeAddress
        })
      });
      const finalOrder = await finalOrderRes.json();
      if (finalOrderRes.ok) {
        completeOrderSuccess(finalOrder._id);
      } else {
        addNotification('Simulated payment logged, order creation failed.', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completeOrderSuccess = (id) => {
    setOrderId(id);
    clearCart();
    fetchUserProfile(); // Reload profile details (wallet balances/points)
    setStep(3);

    // Blast confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const totalItems = cart.reduce((a, c) => a + c.quantity, 0);
  const payableAmount = Math.max(0, getTotal() - walletUsed);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-4 mb-8 bg-white/70 backdrop-blur-md border border-slate-200/50 py-4 px-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-2xl flex items-center justify-center font-black text-xs ${
            step >= 1 ? 'bg-blue-650 text-white shadow-md' : 'bg-slate-200 text-slate-500'
          }`}>
            1
          </div>
          <span className={`text-[10px] font-extrabold tracking-wider ${step >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>SHIPPING ADDRESS</span>
        </div>
        <div className="w-16 h-[1.5px] bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-2xl flex items-center justify-center font-black text-xs ${
            step >= 2 ? 'bg-blue-650 text-white shadow-md' : 'bg-slate-200 text-slate-500'
          }`}>
            2
          </div>
          <span className={`text-[10px] font-extrabold tracking-wider ${step >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>PAYMENT MODE</span>
        </div>
        <div className="w-16 h-[1.5px] bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-2xl flex items-center justify-center font-black text-xs ${
            step >= 3 ? 'bg-blue-650 text-white shadow-md' : 'bg-slate-200 text-slate-500'
          }`}>
            3
          </div>
          <span className={`text-[10px] font-extrabold tracking-wider ${step >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>ORDER SUCCESS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Wizard */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: Shipping */}
          {step === 1 && (
            <div className="glass-card bg-white/75 p-6 border border-slate-200/50 shadow-md">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-650" />
                Shipping Information
              </h3>

              {user && user.shippingAddresses.length > 0 && !showAddressForm ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {user.shippingAddresses.map((addr, idx) => (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedAddressIndex === idx
                            ? 'bg-blue-50/50 border-blue-600 shadow-sm'
                            : 'bg-white border-slate-150 hover:border-slate-300'
                        }`}
                      >
                        <p className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                          Address Option #{idx + 1} {addr.isDefault && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-[8px] rounded-lg font-black uppercase">Default</span>}
                        </p>
                        <p className="text-slate-500 text-xs mt-1.5 font-medium leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} - {addr.zip}, {addr.country}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full text-center border border-dashed border-slate-300 hover:border-slate-400 py-3 text-xs font-black text-slate-650 hover:bg-slate-50 rounded-2xl mt-2 transition-colors"
                  >
                    + Add New Delivery Address
                  </button>

                  <button
                    onClick={handleProceedToPayment}
                    disabled={loading}
                    className="w-full bg-[#fb641b] text-white py-3 rounded-2xl font-black text-xs uppercase hover:bg-[#e25916] transition-all flex items-center justify-center gap-1.5 mt-6 shadow-md"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Deliver Here & Select Payment <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddNewAddress} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3.5">
                    <input
                      type="text"
                      placeholder="Street Address"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="border border-slate-200 bg-white rounded-xl py-2.5 px-4 text-xs focus:border-blue-600 focus:outline-none placeholder-slate-400 w-full"
                    />
                    <div className="grid grid-cols-2 gap-3.5">
                      <input
                        type="text"
                        placeholder="City"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="border border-slate-200 bg-white rounded-xl py-2.5 px-4 text-xs focus:border-blue-600 focus:outline-none placeholder-slate-400 w-full"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="border border-slate-200 bg-white rounded-xl py-2.5 px-4 text-xs focus:border-blue-600 focus:outline-none placeholder-slate-400 w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <input
                        type="text"
                        placeholder="ZIP / Postal Code"
                        required
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="border border-slate-200 bg-white rounded-xl py-2.5 px-4 text-xs focus:border-blue-600 focus:outline-none placeholder-slate-400 w-full"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="border border-slate-200 bg-white rounded-xl py-2.5 px-4 text-xs focus:border-blue-600 focus:outline-none placeholder-slate-400 w-full"
                      />
                    </div>
                  </div>

                  {user && user.shippingAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="text-blue-600 text-xs font-bold hover:underline block pt-1"
                    >
                      Choose from saved address book
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="w-full bg-[#fb641b] text-white py-3 rounded-2xl font-black text-xs uppercase hover:bg-[#e25916] transition-colors flex items-center justify-center gap-1.5 mt-4"
                  >
                    Proceed To Payment Option <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className="glass-card bg-white/75 p-6 border border-slate-200/50 shadow-md">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-650" />
                Select Payment Mode
              </h3>

              <form onSubmit={handlePaymentSubmit} className="space-y-5">
                {/* Reward wallet integration */}
                {user && user.walletBalance > 0 && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-indigo-650" />
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">Use Reward Wallet Cash</p>
                        <p className="text-[10px] text-slate-500 font-semibold">Available balance: {formatPrice(user.walletBalance)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="walletCheckbox"
                        checked={walletUsed > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWalletUsed(Math.min(getTotal(), user.walletBalance));
                          } else {
                            setWalletUsed(0);
                          }
                        }}
                        className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="walletCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Apply ({formatPrice(Math.min(getTotal(), user.walletBalance))})
                      </label>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden bg-white">
                  
                  {/* Razorpay Option */}
                  <label className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors ${paymentMethod === 'razorpay' ? 'bg-blue-50/20' : ''}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-800 uppercase">Razorpay Payment Gateway</p>
                      <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Pay via UPI, Cards, Net Banking, or Mobile Wallets</p>
                    </div>
                    <span className="text-xs font-extrabold text-blue-650 bg-blue-50 px-2.5 py-0.5 rounded-lg">Instant</span>
                  </label>

                  {/* COD Option */}
                  <label className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors ${paymentMethod === 'cod' ? 'bg-blue-50/20' : ''}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-800 uppercase">Cash on Delivery (COD)</p>
                      <p className="text-[10px] text-slate-455 font-semibold mt-0.5">Pay in cash or UPI at the time of package delivery</p>
                    </div>
                  </label>

                  {/* Complete Wallet checkout */}
                  {user && user.walletBalance >= getTotal() && (
                    <label className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors ${paymentMethod === 'wallet' ? 'bg-blue-50/20' : ''}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="wallet"
                        checked={paymentMethod === 'wallet'}
                        onChange={() => {
                          setPaymentMethod('wallet');
                          setWalletUsed(0); // clear deduction check box to avoid confusion
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-black text-indigo-750 uppercase">Full Wallet Payment</p>
                        <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Deduct full amount from your gift welcome balance</p>
                      </div>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">100% Wallet</span>
                    </label>
                  )}
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="border border-slate-200 text-slate-650 hover:bg-slate-50 py-3 rounded-2xl text-xs font-bold flex-1 flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Shipping Address
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#fb641b] text-white py-3 rounded-2xl font-black text-xs uppercase hover:bg-[#e25916] flex-1 flex items-center justify-center gap-1.5 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Starting Secure Tx...
                      </>
                    ) : (
                      `Confirm Order (${formatPrice(payableAmount)})`
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="glass-card bg-white/75 border border-slate-200/50 p-8 shadow-md text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-3xl mx-auto border border-emerald-200">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-850">Order Placed Successfully!</h3>
                <p className="text-[11px] text-slate-500 mt-1 font-semibold">Thank you for your purchase. We are dispatching your items.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-150 max-w-md mx-auto text-left text-xs font-semibold space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="font-mono text-slate-800 select-all font-bold">#{orderId.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className={`font-black uppercase ${paymentMethod === 'cod' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {paymentMethod === 'cod' ? 'Pending (COD)' : 'PAID'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Delivery:</span>
                  <span className="text-slate-800 font-bold">3-5 Business Days</span>
                </div>
              </div>

              <div className="flex gap-4 justify-center max-w-sm mx-auto">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-2xl font-black text-xs flex-1 shadow-sm uppercase tracking-wider"
                >
                  My Orders Desk
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="border border-slate-205 bg-white hover:bg-slate-50 py-2.5 rounded-2xl font-black text-xs text-slate-650 flex-1 uppercase tracking-wider"
                >
                  Shop More Deals
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Details Summary */}
        {step !== 3 && (
          <div className="space-y-4">
            <div className="glass-card bg-white/75 p-5 border border-slate-200/50 shadow-md">
              <h4 className="font-black text-slate-800 text-xs border-b border-slate-100 pb-3 uppercase tracking-wider">
                Price Summary
              </h4>

              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1 my-3 no-scrollbar">
                {cart.map((item) => {
                  const product = item.productId;
                  if (!product) return null;
                  return (
                    <div key={item._id || product._id} className="py-2.5 flex gap-3 text-xs">
                      <div className="w-10 h-10 border border-slate-150 rounded-xl flex-shrink-0 flex items-center justify-center p-1 bg-white">
                        <img src={product.images[0]} alt={product.title} className="h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-slate-800 truncate">{product.title}</h5>
                        <p className="text-[10px] text-slate-450 font-bold mt-0.5">
                          Qty: {item.quantity} × {formatPrice(product.price)}
                        </p>
                      </div>
                      <span className="font-extrabold text-slate-850 flex-shrink-0">
                        {formatPrice(product.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-150 pt-3 space-y-2 text-xs font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Price ({totalItems} items)</span>
                  <span className="text-slate-800 font-bold">{formatPrice(getSubtotal())}</span>
                </div>
                {getDiscountAmount() > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Promo Discount</span>
                    <span>-{formatPrice(getDiscountAmount())}</span>
                  </div>
                )}
                {walletUsed > 0 && (
                  <div className="flex justify-between text-indigo-650">
                    <span>Wallet Balance Applied</span>
                    <span>-{formatPrice(walletUsed)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-emerald-600 font-extrabold uppercase">Free</span>
                </div>
                <div className="flex justify-between text-slate-850 text-sm font-black border-t border-dashed border-slate-200 pt-3">
                  <span>Net Payable Amount</span>
                  <span>{formatPrice(payableAmount)}</span>
                </div>
              </div>

              {/* Reward Points Alert */}
              <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>You will earn {Math.round(Math.max(0, getTotal() - walletUsed) * 0.1)} loyalty points from this checkout!</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Simulated Razorpay Modal Popup */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs">R</div>
                <h4 className="text-xs font-black uppercase text-slate-800">Razorpay Payment Sandbox</h4>
              </div>
              <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">Sandbox Simulation</span>
            </div>

            <div className="text-xs font-semibold text-slate-500 space-y-2">
              <div className="flex justify-between">
                <span>Merchant:</span>
                <span className="font-bold text-slate-800">NexaCart Shopping</span>
              </div>
              <div className="flex justify-between">
                <span>Razorpay Order ID:</span>
                <span className="font-mono text-slate-800 font-bold">{razorpayOrder?.id}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-sm text-slate-800 font-black">
                <span>Total Amount:</span>
                <span>{formatPrice(payableAmount)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 text-[10px] font-bold text-slate-550 leading-relaxed">
              👉 This sandbox represents Razorpay payment checkout. Clicking approve validates signature and triggers order creation.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowMockModal(false);
                  addNotification('Payment cancelled by user', 'info');
                }}
                className="flex-1 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-650 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider"
              >
                Cancel Tx
              </button>
              <button
                onClick={handleApproveMockPayment}
                className="flex-1 bg-blue-650 hover:bg-blue-750 text-white py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md"
              >
                Approve Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;
