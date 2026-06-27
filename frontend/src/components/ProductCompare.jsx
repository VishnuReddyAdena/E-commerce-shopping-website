import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCompare, clearCompare } from '../store/compareSlice.js';
import { X, ArrowRightLeft, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProductCompare = () => {
  const compareItems = useSelector(state => state.compare.items);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { formatPrice } = useApp();

  if (compareItems.length === 0) return null;

  // Extract all spec keys from compared items
  const allSpecKeys = Array.from(
    new Set(
      compareItems.flatMap(item => 
        item.specifications ? Object.keys(item.specifications) : []
      )
    )
  );

  return (
    <>
      {/* Floating Bottom Bar */}
      <div className="fixed bottom-6 left-6 z-40 bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl px-5 py-3 rounded-2xl flex items-center gap-5 animate-fade-in">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-700">Compare ({compareItems.length}/3)</span>
        </div>

        <div className="flex items-center gap-3">
          {compareItems.map(item => (
            <div key={item._id} className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl">
              <span className="text-[10px] font-bold text-slate-700 max-w-[80px] truncate">{item.title}</span>
              <button
                onClick={() => dispatch(removeFromCompare(item._id))}
                className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => setIsOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] uppercase rounded-xl shadow-sm transition-all"
          >
            Compare Now
          </button>
          <button
            onClick={() => dispatch(clearCompare())}
            className="text-[10px] font-bold text-slate-450 hover:text-slate-700 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Comparison Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in border border-slate-100">
            {/* Header */}
            <div className="p-5 border-b border-slate-150 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-black uppercase text-slate-800">Product Comparison Matrix</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-455 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Matrix Table */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-4 gap-6 border-b border-slate-100 pb-6 items-start">
                <div className="text-xs font-black text-slate-400 pt-3">Product Summary</div>
                {compareItems.map(item => (
                  <div key={item._id} className="text-center space-y-3">
                    <div className="w-24 h-24 mx-auto border border-slate-150 rounded-2xl flex items-center justify-center p-2 bg-white">
                      <img src={item.images[0]} alt={item.title} className="h-full object-contain" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2">{item.title}</h4>
                    <span className="inline-block text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                ))}
                {/* Pad columns if less than 3 products */}
                {compareItems.length < 3 && Array.from({ length: 3 - compareItems.length }).map((_, i) => (
                  <div key={i} className="border border-dashed border-slate-250 rounded-2xl h-44 flex flex-col items-center justify-center text-slate-350 text-[10px] font-bold">
                    Add another product to compare
                  </div>
                ))}
              </div>

              {/* Specs Rows */}
              <div className="divide-y divide-slate-100 py-3">
                <div className="grid grid-cols-4 py-3.5 text-xs">
                  <div className="font-bold text-slate-500">Brand</div>
                  {compareItems.map(item => (
                    <div key={item._id} className="font-semibold text-slate-800">{item.brand || 'Generic'}</div>
                  ))}
                </div>

                <div className="grid grid-cols-4 py-3.5 text-xs">
                  <div className="font-bold text-slate-500">Category</div>
                  {compareItems.map(item => (
                    <div key={item._id} className="font-semibold text-slate-800">{item.category}</div>
                  ))}
                </div>

                <div className="grid grid-cols-4 py-3.5 text-xs">
                  <div className="font-bold text-slate-500">Rating</div>
                  {compareItems.map(item => (
                    <div key={item._id} className="flex items-center gap-1 font-semibold text-slate-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.ratings?.average || '0.0'} ({item.ratings?.count || 0} reviews)</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 py-3.5 text-xs">
                  <div className="font-bold text-slate-500">Availability</div>
                  {compareItems.map(item => (
                    <div key={item._id} className={`font-semibold ${item.inventoryCount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.inventoryCount > 0 ? `In Stock (${item.inventoryCount})` : 'Out of Stock'}
                    </div>
                  ))}
                </div>

                {allSpecKeys.map(key => (
                  <div key={key} className="grid grid-cols-4 py-3.5 text-xs">
                    <div className="font-bold text-slate-500 capitalize">{key}</div>
                    {compareItems.map(item => (
                      <div key={item._id} className="font-medium text-slate-850">
                        {item.specifications?.[key] || item.specifications?.get?.(key) || '-'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default ProductCompare;
