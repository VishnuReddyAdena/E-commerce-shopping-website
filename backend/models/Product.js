import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  subCategory: { type: String },
  images: [{ type: String, required: true }],
  videos: [{ type: String }],
  inventoryCount: { type: Number, required: true, default: 0 },
  ratings: {
    average: { type: Number, required: true, default: 0 },
    count: { type: Number, required: true, default: 0 }
  },
  reviews: [reviewSchema],
  brand: { type: String, required: true, default: 'Generic' },
  colors: [{ type: String }],
  sizes: [{ type: String }],
  specifications: { type: Map, of: String, default: {} },
  variants: [{
    color: String,
    size: String,
    price: Number,
    inventoryCount: Number
  }],
  isFlashSale: { type: Boolean, default: false },
  flashSalePrice: { type: Number }
}, {
  timestamps: true
});

// Pre-save validation or calculations for reviews count and average
productSchema.methods.calculateRatings = function() {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.ratings.average = Math.round((sum / this.reviews.length) * 10) / 10;
    this.ratings.count = this.reviews.length;
  }
};

const Product = mongoose.model('Product', productSchema);
export default Product;
