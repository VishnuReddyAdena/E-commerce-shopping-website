import Brand from '../models/Brand.js';
import { memoryBrands } from '../config/memoryStore.js';

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = async (req, res) => {
  if (!global.isDbConnected) {
    return res.json(memoryBrands);
  }
  try {
    const brands = await Brand.find({});
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create brand
// @route   POST /api/brands
// @access  Private/Admin
export const createBrand = async (req, res) => {
  const { name, logo, description } = req.body;

  if (!global.isDbConnected) {
    const brandExists = memoryBrands.find(b => b.name.toLowerCase() === name.toLowerCase());
    if (brandExists) {
      return res.status(400).json({ message: 'Brand already exists' });
    }
    const created = {
      _id: `brand_${Math.random().toString(36).substring(2, 9)}`,
      name,
      logo: logo || '/placeholder-brand.jpg',
      description
    };
    memoryBrands.push(created);
    return res.status(201).json(created);
  }

  try {
    const brandExists = await Brand.findOne({ name });
    if (brandExists) {
      return res.status(400).json({ message: 'Brand already exists' });
    }

    const brand = new Brand({ name, logo, description });
    const createdBrand = await brand.save();
    res.status(201).json(createdBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
export const updateBrand = async (req, res) => {
  const { name, logo, description } = req.body;

  if (!global.isDbConnected) {
    const brand = memoryBrands.find(b => b._id === req.params.id);
    if (brand) {
      brand.name = name || brand.name;
      brand.logo = logo || brand.logo;
      brand.description = description || brand.description;
      return res.json(brand);
    }
    return res.status(404).json({ message: 'Brand not found' });
  }

  try {
    const brand = await Brand.findById(req.params.id);
    if (brand) {
      brand.name = name || brand.name;
      brand.logo = logo || brand.logo;
      brand.description = description || brand.description;

      const updatedBrand = await brand.save();
      res.json(updatedBrand);
    } else {
      res.status(404).json({ message: 'Brand not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
export const deleteBrand = async (req, res) => {
  if (!global.isDbConnected) {
    const idx = memoryBrands.findIndex(b => b._id === req.params.id);
    if (idx > -1) {
      memoryBrands.splice(idx, 1);
      return res.json({ message: 'Brand removed (sandbox)' });
    }
    return res.status(404).json({ message: 'Brand not found' });
  }

  try {
    const brand = await Brand.findById(req.params.id);
    if (brand) {
      await brand.deleteOne();
      res.json({ message: 'Brand removed' });
    } else {
      res.status(404).json({ message: 'Brand not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
