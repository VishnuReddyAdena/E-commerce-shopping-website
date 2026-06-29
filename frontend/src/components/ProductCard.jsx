import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCompare, removeFromCompare } from '../store/compareSlice.js';
import { useApp } from '../context/AppContext';
import { Heart, Star, ShoppingCart, ArrowRightLeft } from 'lucide-react';

export const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { wishlist, toggleWishlist, formatPrice, token, addToCart } = useApp();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Guard: redirect guests to sign-in modal on any interactive action
  const requireAuth = (action) => {
    if (!token) {
      navigate('/login');
      return;
    }
    action();
  };
  const compareItems = useSelector(state => state.compare.items);

  const isSaved = wishlist.includes(product._id);
  const isOutOfStock = product.inventoryCount === 0;
  const isComparing = compareItems.some(item => item._id === product._id);

  // Simulate pricing discount values
  const originalPrice = Math.round(product.price * 1.35);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (isComparing) {
      dispatch(removeFromCompare(product._id));
    } else {
      if (compareItems.length >= 3) {
        alert("You can compare up to 3 products at a time!");
        return;
      }
      dispatch(addToCompare(product));
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="glass-card glass-card-hover p-6 flex flex-col md:flex-row gap-6 items-center border border-slate-200/50 bg-white/60 relative group">
        
        {/* Save/Wishlist button */}
        <button
          onClick={() => requireAuth(() => toggleWishlist(product._id))}
          className={`absolute top-4 right-4 p-2 rounded-full bg-white border border-slate-100 shadow-sm transition-all ${
            isSaved ? 'text-rose-500 hover:text-rose-650' : 'text-slate-400 hover:text-rose-500 hover:scale-105'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Product image */}
        <div className="w-48 h-48 flex-shrink-0 flex items-center justify-center p-3 relative bg-slate-50/50 rounded-2xl">
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full max-h-40 object-contain group-hover:scale-103 transition-transform duration-300"
          />
          {product.isFlashSale && (
            <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-lg shadow-sm">
              Flash Deal
            </span>
          )}
        </div>

        {/* Info panel */}
        <div className="flex-1 w-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase bg-indigo-50 px-2 py-0.5 rounded-lg">
                {product.category}
              </span>
              {isOutOfStock ? (
                <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-lg">
                  Out of Stock
                </span>
              ) : product.inventoryCount <= 5 ? (
                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg animate-pulse">
                  Only {product.inventoryCount} left
                </span>
              ) : null}
            </div>

            <Link to={`/product/${product._id}`}>
              <h3 className="font-extrabold text-lg text-slate-800 hover:text-blue-650 transition-colors line-clamp-1">
                {product.title}
              </h3>
            </Link>

            <div className="flex items-center gap-2 mt-2">
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-0.5 leading-none">
                {product.ratings?.average || '0.0'} <Star className="w-2.5 h-2.5 fill-current" />
              </span>
              <span className="text-[11px] text-slate-450 font-bold">
                ({product.ratings?.count || 0} reviews)
              </span>
            </div>

            <p className="text-slate-500 text-xs mt-3.5 line-clamp-2 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">{formatPrice(product.price)}</span>
              <span className="text-xs text-slate-400 line-through font-bold">{formatPrice(originalPrice)}</span>
              <span className="text-xs text-emerald-600 font-bold">{discountPercent}% Off</span>
            </div>
            
            <div className="flex gap-2.5">
              {/* Compare toggle */}
              <button
                onClick={(e) => { e.preventDefault(); requireAuth(() => handleCompareClick(e)); }}
                className={`p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-350 transition-all ${
                  isComparing ? 'bg-indigo-50 border-indigo-250 text-indigo-700' : 'text-slate-500'
                }`}
                title="Add to Compare"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => { e.preventDefault(); requireAuth(() => addToCart(product, 1)); }}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all"
              >
                Add to Cart
              </button>

              <button
                onClick={() => requireAuth(() => navigate(`/product/${product._id}`))}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all`}
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Grid Layout Card
  return (
    <div className="glass-card glass-card-hover p-4.5 flex flex-col justify-between border border-slate-200/50 bg-white/60 relative group">
      
      {/* Save Toggle */}
      <button
        onClick={() => requireAuth(() => toggleWishlist(product._id))}
        className={`absolute top-3 right-3 p-2 rounded-full bg-white/95 border border-slate-100 shadow-sm z-10 transition-all ${
          isSaved ? 'text-rose-500 hover:text-rose-650' : 'text-slate-405 hover:text-rose-500 hover:scale-105'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Panel */}
      <div className="h-44 w-full flex items-center justify-center p-2 relative rounded-2xl bg-slate-50/50 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          className="h-full max-h-36 object-contain group-hover:scale-103 transition-transform duration-300"
        />

        {isOutOfStock ? (
          <span className="absolute bottom-2.5 left-2.5 text-[8px] font-black uppercase tracking-wider bg-rose-650 text-white px-2 py-0.5 rounded-lg shadow-md">
            Out of Stock
          </span>
        ) : product.isFlashSale ? (
          <span className="absolute bottom-2.5 left-2.5 text-[8px] font-black uppercase tracking-wider bg-gradient-to-tr from-amber-500 to-orange-550 text-white px-2 py-0.5 rounded-lg shadow-md">
            Flash Deal
          </span>
        ) : null}
      </div>

      {/* Details */}
      <div className="mt-4 flex-grow flex flex-col justify-between text-center items-center">
        <div className="flex flex-col items-center w-full">
          <span className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase block text-center">
            {product.category}
          </span>
          <Link to={`/product/${product._id}`} className="block text-center w-full">
            <h3 className="font-extrabold text-slate-800 text-xs hover:text-blue-650 transition-colors mt-1 line-clamp-1">
              {product.title}
            </h3>
          </Link>
          
          <div className="flex items-center justify-center gap-1.5 mt-2 w-full">
            <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 leading-none">
              {product.ratings?.average || '0.0'} <Star className="w-2 h-2 fill-current" />
            </span>
            <span className="text-[10px] text-slate-455 font-bold">
              ({product.ratings?.count || 0})
            </span>
          </div>
        </div>

        {/* Pricing Panel */}
        <div className="mt-4 pt-3 pb-3 border-t border-slate-100 flex flex-col items-center gap-2.5 w-full">
          <div className="flex items-baseline justify-center gap-1.5 w-full">
            <span className="text-base font-black text-slate-800">{formatPrice(product.price)}</span>
            <span className="text-[10px] text-slate-400 line-through font-bold">{formatPrice(originalPrice)}</span>
            <span className="text-[10px] text-emerald-600 font-bold">{discountPercent}% Off</span>
          </div>
          
          <div className="flex items-center gap-2 mx-1">
            {/* Compare Toggle */}
            <button
              onClick={(e) => { e.preventDefault(); requireAuth(() => handleCompareClick(e)); }}
              className={`p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-350 transition-all flex-shrink-0 ${
                isComparing ? 'bg-indigo-50 border-indigo-250 text-indigo-700' : 'text-slate-500'
              }`}
              title="Add to Compare"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => { e.preventDefault(); requireAuth(() => addToCart(product, 1)); }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-2.5 px-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:shadow-lg transition-all text-center flex items-center justify-center gap-1.5 shadow-md shadow-blue-200"
            >
              <ShoppingCart className="w-3 h-3" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
