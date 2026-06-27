import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  logo: { type: String, default: '/placeholder-brand.jpg' },
  description: { type: String }
}, {
  timestamps: true
});

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
