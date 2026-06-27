import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { X, Trash2, Plus, Minus, CreditCard, Gift, ShoppingBag } from 'lucide-react';

export const CartDrawer = ({ isOpen, onClose }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getSubtotal,
    getDiscountAmount,
    getTotal,
    promoCode,
    promoDiscount,
    promoDiscountType,
    validatePromoCode,
    promoError,
    formatPrice
  } = useApp();
  
  const [promoInput, setPromoInput] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const totalItems = cart.reduce((a, c) => a + c.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background dark overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        {/* Slide-over panel */}
        <div className="pointer-events-auto w-screen max-w-md transform transition-transform duration-300">
          <div className="flex h-full flex-col justify-between bg-white border-l border-slate-200/50 p-6 shadow-2xl rounded-l-3xl">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                Shopping Cart
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-bold">
                  {totalItems} Items
                </span>
              </h2>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-150">
                    <ShoppingBag className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Your cart is empty</h3>
                  <p className="text-slate-405 text-[11px] font-semibold mt-1">Browse our store deals and add items to your cart!</p>
                </div>
              ) : (
                cart.map((item) => {
                  const product = item.productId;
                  if (!product) return null;
                  return (
                    <div 
                      key={item._id || product._id}
                      className="border border-slate-150 rounded-2xl p-4 flex gap-4 relative bg-slate-50/40 hover:bg-slate-50 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 border border-slate-150 flex-shrink-0 flex items-center justify-center p-1.5 bg-white rounded-xl">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="h-full object-contain"
                        />
                      </div>

                      {/* Info & quantity Counter */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-extrabold text-xs text-slate-800 truncate pr-6">{product.title}</h4>
                            <button
                              onClick={() => removeFromCart(product._id)}
                              className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[9px] text-indigo-650 font-bold uppercase">{product.category}</span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Counter */}
                          <div className="flex items-center bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <button
                              onClick={() => updateQuantity(product._id, item.quantity - 1, product.inventoryCount)}
                              className="px-2.5 py-1 text-slate-650 hover:bg-slate-50 text-xs font-black border-r border-slate-200"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-800 select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product._id, item.quantity + 1, product.inventoryCount)}
                              className="px-2.5 py-1 text-slate-650 hover:bg-slate-50 text-xs font-black border-l border-slate-200"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-black text-slate-855 text-sm">
                            {formatPrice(product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Price Calculations */}
            {cart.length > 0 && (
              <div className="border-t border-slate-150 pt-4 space-y-4">
                {/* Promo Code Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. GLASS3D)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl py-2 px-3 pl-8 text-xs focus:border-blue-600 focus:outline-none"
                    />
                    <Gift className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <button
                    onClick={() => validatePromoCode(promoInput)}
                    className="border border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50 py-2 px-4 rounded-xl text-xs font-bold transition-all"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-rose-600 text-[10px] font-bold">{promoError}</p>}
                {promoCode && (
                  <p className="text-emerald-600 text-[10px] font-bold">
                    Promo Applied: {promoCode} ({promoDiscountType === 'percent' ? `${promoDiscount}%` : formatPrice(promoDiscount)} Off)
                  </p>
                )}

                {/* Subtotals */}
                <div className="space-y-2 text-xs font-semibold text-slate-500">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="text-slate-800 font-bold">{formatPrice(getSubtotal())}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-emerald-605">
                      <span>Discount</span>
                      <span>-{formatPrice(getDiscountAmount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-emerald-600 font-bold uppercase">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 text-sm font-black text-slate-850">
                    <span>Grand Total</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#fb641b] text-white py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wide hover:bg-[#e25916] transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  Checkout Now
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
