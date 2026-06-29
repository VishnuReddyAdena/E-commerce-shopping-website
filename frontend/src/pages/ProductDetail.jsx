import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToRecentlyViewed } from '../store/recentlyViewedSlice.js';
import { useApp } from '../context/AppContext';
import { Star, ShoppingCart, Send, ArrowLeft, ShieldCheck, CheckCircle, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { token, addToCart, backendUrl, addNotification, formatPrice } = useApp();
  const navigate = useNavigate();

  // Guard: open sign-in modal for guests
  const requireAuth = (action) => {
    if (!token) {
      navigate('/login');
      return;
    }
    action();
  };

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review fields
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  // Carousel Ref and handlers
  const carouselRef = useRef(null);
  const media = product
    ? [
        ...product.images.map((url) => ({ type: 'image', url })),
        ...(product.videos || []).map((url) => ({ type: 'video', url }))
      ]
    : [];

  const fetchProductDetail = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/products/${id}`);
      const data = await response.json();
      if (response.ok) {
        setProduct(data);
        setActiveImage(data.images[0]);
        // Dispatch to Redux Recently Viewed list
        dispatch(addToRecentlyViewed(data));
      } else {
        addNotification(data.message || 'Product details not found', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/products/${id}/recommendations`);
      const data = await response.json();
      if (response.ok) setRecommendations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFrequentlyBought = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/products/${id}/frequently-bought`);
      const data = await response.json();
      if (response.ok) setFrequentlyBought(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProductDetail(), fetchRecommendations(), fetchFrequentlyBought()]).finally(() => {
      setLoading(false);
    });
  }, [id]);

  // Carousel Scroll and Navigation
  const handleCarouselScroll = (e) => {
    const width = e.target.clientWidth;
    if (width > 0) {
      const scrollLeft = e.target.scrollLeft;
      const index = Math.round(scrollLeft / width);
      setActiveMediaIdx(index);
    }
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const width = carouselRef.current.clientWidth;
      const currentScroll = carouselRef.current.scrollLeft;
      const targetScroll =
        direction === 'left'
          ? currentScroll - width
          : currentScroll + width;
      
      carouselRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const jumpToSlide = (index) => {
    if (carouselRef.current) {
      const width = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: index * width,
        behavior: 'smooth'
      });
      setActiveMediaIdx(index);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      addNotification('Please login to leave a review', 'warning');
      return;
    }
    
    setReviewSubmitLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await response.json();
      if (response.ok) {
        addNotification('Review submitted successfully!', 'success');
        setComment('');
        fetchProductDetail();
      } else {
        addNotification(data.message || 'Failed to submit review', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Server connection error', 'error');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, 1);
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center bg-white border border-slate-200 mt-6 rounded-[24px]">
        <h3 className="font-extrabold text-slate-800 text-sm">Product not found</h3>
        <Link to="/" className="text-blue-600 font-bold hover:underline mt-4 inline-block">
          Return to home catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.inventoryCount === 0;
  const originalPrice = Math.round(product.price * 1.35);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Back button */}
      <Link to="/shop" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Shop catalog
      </Link>

      {/* Main Container */}
      <div className="glass-card bg-white/60 p-6 grid grid-cols-1 lg:grid-cols-5 gap-8 border border-slate-200/50 shadow-md">
        
        {/* Left column: media carousel and action buttons */}
        <div className="lg:col-span-2 flex flex-col gap-5 w-full">
          <div className="relative w-full overflow-hidden border border-slate-200/80 rounded-3xl bg-white shadow-sm flex flex-col items-center group">
            {/* Horizontal Scrollable Container */}
            <div 
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex overflow-x-auto snap-x snap-mandatory w-full h-[320px] sm:h-[400px] no-scrollbar scroll-smooth bg-slate-50/20"
            >
              {media.map((item, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center p-6 relative select-none">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={`${product.title} - ${idx + 1}`}
                      className="max-h-full max-w-full object-contain hover:scale-102 transition-transform duration-350"
                      draggable="false"
                    />
                  ) : (
                    <video
                      src={item.url}
                      controls
                      playsInline
                      muted
                      loop
                      className="max-h-full max-w-full rounded-2xl object-contain bg-black shadow-inner"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Left & Right navigation arrows */}
            {media.length > 1 && (
              <>
                <button 
                  onClick={() => scrollCarousel('left')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2.5 rounded-full border border-slate-200 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                  title="Previous Media"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => scrollCarousel('right')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2.5 rounded-full border border-slate-200 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                  title="Next Media"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Dots Indicator representing Photos (Circle) and Videos (Play symbol) */}
            {media.length > 1 && (
              <div className="absolute bottom-5 flex justify-center items-center gap-2.5 bg-slate-900/60 backdrop-blur-md py-2 px-4 rounded-full z-10 border border-white/10 shadow-lg">
                {media.map((item, idx) => {
                  const isActive = activeMediaIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => jumpToSlide(idx)}
                      className={`flex items-center justify-center transition-all ${
                        isActive ? 'scale-110 text-[#2874F0]' : 'text-white/60 hover:text-white'
                      }`}
                      title={item.type === 'image' ? `Photo ${idx + 1}` : `Video`}
                    >
                      {item.type === 'image' ? (
                        <div className={`w-2.5 h-2.5 rounded-full transition-all ${isActive ? 'bg-[#2874F0] ring-4 ring-[#2874F0]/30 scale-110' : 'bg-white/70'}`} />
                      ) : (
                        <Play className={`w-3.5 h-3.5 fill-current transition-all ${isActive ? 'text-[#2874F0]' : 'text-white/80'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              onClick={() => requireAuth(() => addToCart(product))}
              disabled={isOutOfStock}
              className={`py-3.5 rounded-2xl font-black text-xs text-white bg-amber-500 hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 shadow-md uppercase tracking-wider ${
                isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            
            <button
              onClick={() => requireAuth(() => handleBuyNow())}
              disabled={isOutOfStock}
              className={`py-3.5 rounded-2xl font-black text-xs text-white bg-[#fb641b] hover:bg-[#e25916] transition-colors flex items-center justify-center gap-2 shadow-md uppercase tracking-wider ${
                isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* Right column: specifications, ratings, title */}
        <div className="lg:col-span-3 space-y-5">
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">{product.title}</h1>
            
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-0.5 leading-none">
                {product.ratings?.average || '0.0'} <Star className="w-2.5 h-2.5 fill-current" />
              </span>
              <span className="text-xs text-slate-450 font-bold">
                {product.ratings?.count || 0} Ratings & reviews
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-3 pt-2">
            <span className="text-2xl font-black text-slate-855">{formatPrice(product.price)}</span>
            <span className="text-xs text-slate-400 line-through font-bold">{formatPrice(originalPrice)}</span>
            <span className="text-xs text-emerald-600 font-bold">{discountPercent}% Off</span>
          </div>

          {/* Availability Alert */}
          <div className="text-xs font-bold">
            {isOutOfStock ? (
              <span className="text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-150">Temporarily Out of Stock</span>
            ) : product.inventoryCount <= 5 ? (
              <span className="text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 animate-pulse">Running Low! Only {product.inventoryCount} left.</span>
            ) : (
              <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">Product In Stock</span>
            )}
          </div>

          {/* Summary description */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Item Overview</h4>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          {/* Specifications Table (MAPPED DYNAMICALLY!) */}
          {product.specifications && (
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Specifications</h4>
              <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white/70">
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="divide-x divide-slate-100">
                      <td className="px-4 py-2 font-bold text-slate-500 w-1/3 bg-slate-50">Brand</td>
                      <td className="px-4 py-2 font-semibold text-slate-700">{product.brand || 'Generic'}</td>
                    </tr>
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <tr key={key} className="divide-x divide-slate-100">
                        <td className="px-4 py-2 font-bold text-slate-500 w-1/3 bg-slate-50 capitalize">{key}</td>
                        <td className="px-4 py-2 font-semibold text-slate-700">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Review submission and ratings feedbacks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Write review */}
        <div className="lg:col-span-1">
          <div className="glass-card bg-white/70 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Leave Feedback</h3>
            {token ? (
              <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[9px] text-slate-450 font-bold block mb-1">Rating Rating Value</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs bg-white focus:outline-none"
                  >
                    <option value={5}>5 ★ - Excellent</option>
                    <option value={4}>4 ★ - Good</option>
                    <option value={3}>3 ★ - Average</option>
                    <option value={2}>2 ★ - Dissatisfied</option>
                    <option value={1}>1 ★ - Bad</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-450 font-bold block mb-1">Review comment</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Tell other shoppers about your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none placeholder-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitLoading}
                  className="w-full bg-[#fb641b] text-white py-2.5 rounded-xl font-black text-xs uppercase shadow-md hover:bg-[#e25916] flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Post Review
                </button>
              </form>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 font-semibold bg-slate-50/50 border border-slate-150 rounded-xl">
                Login to write product reviews.
              </div>
            )}
          </div>
        </div>

        {/* Feedbacks list */}
        <div className="lg:col-span-2">
          <div className="glass-card bg-white/70 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Feedbacks</h3>
            {product.reviews.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                No reviews posted yet. Be the first to review this product!
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1 no-scrollbar">
                {product.reviews.map((rev, idx) => (
                  <div key={rev._id} className={`pt-4 ${idx === 0 ? 'pt-0' : ''}`}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-650 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 leading-none">
                          {rev.rating} ★
                        </span>
                        <span className="text-[10px] text-slate-800 font-extrabold flex items-center gap-1">
                          {rev.userName}
                          <span className="flex items-center gap-0.5 text-emerald-650 text-[9px] font-black uppercase bg-emerald-50 px-1.5 py-0.5 rounded-lg border border-emerald-100">
                            <ShieldCheck className="w-3 h-3 text-emerald-650" /> Verified Buyer
                          </span>
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Frequently Bought Together Shelf */}
      {frequentlyBought.length > 0 && (
        <div className="glass-card p-6 shadow-sm border border-slate-200/50 bg-indigo-50/15">
          <div className="flex items-center gap-2 border-b border-slate-150 pb-3 mb-5">
            <CheckCircle className="w-4.5 h-4.5 text-blue-650" />
            <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider">Frequently Bought Together</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {frequentlyBought.map((rec) => (
              <ProductCard key={rec._id} product={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Similar Shelf */}
      {recommendations.length > 0 && (
        <div className="glass-card p-6 shadow-sm border border-slate-200/50">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 mb-5">Similar Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <ProductCard key={rec._id} product={rec} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;
