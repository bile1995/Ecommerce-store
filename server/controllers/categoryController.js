import Category from '../models/Category.js';
import mongoose from 'mongoose';

const isMongoConnected = () => mongoose.connection.readyState === 1;

export const getCategories = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const category = await Category.findById(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const { name, slug, description, image, subcategories, featured } = req.body;
    const category = new Category({ name, slug, description, image, subcategories, featured });
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const category = await Category.findById(req.params.id);
    if (category) {
      category.name = req.body.name || category.name;
      category.slug = req.body.slug || category.slug;
      category.description = req.body.description || category.description;
      category.image = req.body.image || category.image;
      category.subcategories = req.body.subcategories || category.subcategories;
      category.featured = req.body.featured ?? category.featured;
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }
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

export const addSubcategory = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const category = await Category.findById(req.params.id);
    if (category) {
      const { name, slug, description, image } = req.body;
      category.subcategories.push({ name, slug, description, image });
      const updatedCategory = await category.save();
      res.status(201).json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const category = await Category.findById(req.params.id);
    if (category) {
      const subcategory = category.subcategories.id(req.params.subId);
      if (subcategory) {
        subcategory.name = req.body.name || subcategory.name;
        subcategory.slug = req.body.slug || subcategory.slug;
        subcategory.description = req.body.description || subcategory.description;
        subcategory.image = req.body.image || subcategory.image;
        const updatedCategory = await category.save();
        res.json(updatedCategory);
      } else {
        res.status(404).json({ message: 'Subcategory not found' });
      }
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not available' });
    }
    const category = await Category.findById(req.params.id);
    if (category) {
      category.subcategories.pull(req.params.subId);
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
