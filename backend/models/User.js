import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const shippingAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  googleId: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  country: { type: String, default: 'India' },
  shippingAddresses: [shippingAddressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  walletBalance: { type: Number, default: 100 }, // Simulated gift welcome credit
  loyaltyPoints: { type: Number, default: 10 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isBanned: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
