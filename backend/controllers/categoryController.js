import { supabase } from '../config/supabase.js';
import { memoryCategories } from '../config/memoryStore.js';

// Map Postgres row to Mongoose structure
const mapCategoryToFrontend = (cat) => {
  if (!cat) return null;
  return {
    _id: cat.id,
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
    createdAt: cat.created_at
  };
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  if (!global.isDbConnected) {
    return res.json(memoryCategories);
  }
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(categories.map(mapCategoryToFrontend));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name, image } = req.body;

  if (!global.isDbConnected) {
    const categoryExists = memoryCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const created = {
      _id: `cat_${Math.random().toString(36).substring(2, 9)}`,
      name,
      image: image || '/placeholder-category.jpg'
    };
    memoryCategories.push(created);
    return res.status(201).json(created);
  }

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const { data: categoryExists } = await supabase
      .from('categories')
      .select('*')
      .eq('name', name)
      .maybeSingle();

    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const { data: createdCategory, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        image: image || '/placeholder-category.jpg'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(mapCategoryToFrontend(createdCategory));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  const { name, image } = req.body;

  if (!global.isDbConnected) {
    const category = memoryCategories.find(c => c._id === req.params.id);
    if (category) {
      category.name = name || category.name;
      category.image = image || category.image;
      return res.json(category);
    }
    return res.status(404).json({ message: 'Category not found' });
  }

  try {
    const updateFields = {};
    if (name) {
      updateFields.name = name;
      updateFields.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (image !== undefined) updateFields.image = image;

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update(updateFields)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    if (updatedCategory) {
      res.json(mapCategoryToFrontend(updatedCategory));
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  if (!global.isDbConnected) {
    const idx = memoryCategories.findIndex(c => c._id === req.params.id);
    if (idx > -1) {
      memoryCategories.splice(idx, 1);
      return res.json({ message: 'Category removed (sandbox)' });
    }
    return res.status(404).json({ message: 'Category not found' });
  }

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
