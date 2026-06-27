import Category from '../models/Category.js';
import { memoryCategories } from '../config/memoryStore.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  if (!global.isDbConnected) {
    return res.json(memoryCategories);
  }
  try {
    const categories = await Category.find({}).populate('parentCategory');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name, description, image, parentCategory } = req.body;

  if (!global.isDbConnected) {
    const categoryExists = memoryCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const parent = parentCategory ? memoryCategories.find(c => c._id === parentCategory) : null;
    const created = {
      _id: `cat_${Math.random().toString(36).substring(2, 9)}`,
      name,
      description,
      image: image || '/placeholder-category.jpg',
      parentCategory: parent
    };
    memoryCategories.push(created);
    return res.status(201).json(created);
  }

  try {
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      name,
      description,
      image,
      parentCategory: parentCategory || null
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  const { name, description, image, parentCategory } = req.body;

  if (!global.isDbConnected) {
    const category = memoryCategories.find(c => c._id === req.params.id);
    if (category) {
      category.name = name || category.name;
      category.description = description || category.description;
      category.image = image || category.image;
      if (parentCategory !== undefined) {
        category.parentCategory = parentCategory ? memoryCategories.find(c => c._id === parentCategory) : null;
      }
      return res.json(category);
    }
    return res.status(404).json({ message: 'Category not found' });
  }

  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      category.name = name || category.name;
      category.description = description || category.description;
      category.image = image || category.image;
      category.parentCategory = parentCategory !== undefined ? (parentCategory || null) : category.parentCategory;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
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
    const category = await Category.findById(req.params.id);
    if (category) {
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
