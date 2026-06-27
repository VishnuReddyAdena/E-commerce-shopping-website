import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String, default: '/placeholder-category.jpg' },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
