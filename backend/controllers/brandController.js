import { supabase } from '../config/supabase.js';
import { memoryBrands } from '../config/memoryStore.js';

// Map Postgres row to Mongoose structure
const mapBrandToFrontend = (brand) => {
  if (!brand) return null;
  return {
    _id: brand.id,
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    createdAt: brand.created_at
  };
};

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = async (req, res) => {
  if (!global.isDbConnected) {
    return res.json(memoryBrands);
  }
  try {
    const { data: brands, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(brands.map(mapBrandToFrontend));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create brand
// @route   POST /api/brands
// @access  Private/Admin
export const createBrand = async (req, res) => {
  const { name, logo } = req.body;

  if (!global.isDbConnected) {
    const brandExists = memoryBrands.find(b => b.name.toLowerCase() === name.toLowerCase());
    if (brandExists) {
      return res.status(400).json({ message: 'Brand already exists' });
    }
    const created = {
      _id: `brand_${Math.random().toString(36).substring(2, 9)}`,
      name,
      logo: logo || '/placeholder-brand.jpg'
    };
    memoryBrands.push(created);
    return res.status(201).json(created);
  }

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const { data: brandExists } = await supabase
      .from('brands')
      .select('*')
      .eq('name', name)
      .maybeSingle();

    if (brandExists) {
      return res.status(400).json({ message: 'Brand already exists' });
    }

    const { data: createdBrand, error } = await supabase
      .from('brands')
      .insert({
        name,
        slug,
        logo: logo || '/placeholder-brand.jpg'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(mapBrandToFrontend(createdBrand));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
export const updateBrand = async (req, res) => {
  const { name, logo } = req.body;

  if (!global.isDbConnected) {
    const brand = memoryBrands.find(b => b._id === req.params.id);
    if (brand) {
      brand.name = name || brand.name;
      brand.logo = logo || brand.logo;
      return res.json(brand);
    }
    return res.status(404).json({ message: 'Brand not found' });
  }

  try {
    const updateFields = {};
    if (name) {
      updateFields.name = name;
      updateFields.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (logo !== undefined) updateFields.logo = logo;

    const { data: updatedBrand, error } = await supabase
      .from('brands')
      .update(updateFields)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    if (updatedBrand) {
      res.json(mapBrandToFrontend(updatedBrand));
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
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Brand removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
