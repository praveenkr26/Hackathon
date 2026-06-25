const Scheme = require('../models/Scheme');
const Joi = require('joi');
const logger = require('../utils/logger');

// ─── Validation Schemas ──────────────────────────────────────────────────────
const matchSchema = Joi.object({
  age: Joi.number().min(0).max(150).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  income: Joi.number().min(0).optional(),
  caste: Joi.string().valid('general', 'sc', 'st', 'obc').optional(),
  state: Joi.string().optional(),
  occupation: Joi.string().optional(),
  disability: Joi.boolean().optional()
});

const schemesData = require('../seeds/real_schemes_atlas.json');

/**
 * GET /api/schemes
 * List all schemes with optional search, filter, and pagination
 */
const getAllSchemes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      status = 'active',
      search,
      featured
    } = req.query;

    let filtered = schemesData.filter(s => s.status === status);

    if (category) {
      filtered = filtered.filter(s => s.category === category);
    }
    if (featured !== undefined) {
      const isFeatured = featured === 'true';
      filtered = filtered.filter(s => s.featured === isFeatured);
    }
    if (search && search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(lowerSearch) ||
        s.description.toLowerCase().includes(lowerSearch) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(lowerSearch)))
      );
    }

    const total = filtered.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginated = filtered.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('getAllSchemes error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch schemes' });
  }
};

/**
 * GET /api/schemes/stats
 * Get statistics about schemes
 */
const getStats = async (req, res) => {
  try {
    const activeSchemes = schemesData.filter(s => s.status === 'active');
    
    // Group by category
    const categoryCount = {};
    activeSchemes.forEach(s => {
      categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
    });
    
    const categoryStats = Object.keys(categoryCount).map(key => ({
      _id: key,
      count: categoryCount[key]
    })).sort((a, b) => b.count - a.count);

    const featuredCount = activeSchemes.filter(s => s.featured).length;

    res.json({
      success: true,
      data: {
        totalSchemes: activeSchemes.length,
        featuredSchemes: featuredCount,
        categories: categoryStats.length,
        beneficiaries: '10+ Crore',
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    logger.error('getStats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

/**
 * GET /api/schemes/categories
 * Get list of all available categories
 */
const getCategories = async (req, res) => {
  try {
    const activeSchemes = schemesData.filter(s => s.status === 'active');
    const categoryCount = {};
    activeSchemes.forEach(s => {
      categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
    });
    
    const categories = Object.keys(categoryCount).map(key => ({
      category: key,
      count: categoryCount[key]
    })).sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('getCategories error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
};

/**
 * GET /api/schemes/:id
 * Get single scheme by ID or slug
 */
const getSchemeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID matches an oid
    let scheme = schemesData.find(s => s._id && s._id.$oid === id);
    if (!scheme) {
      // Fallback: Check if it's the 1 old scheme ID, or search by name
      scheme = schemesData.find(s => s.id === id || s.name === id);
    }

    if (!scheme) {
      return res.status(404).json({ success: false, error: 'Scheme not found' });
    }

    res.json({ success: true, data: scheme });
  } catch (error) {
    logger.error('getSchemeById error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scheme' });
  }
};

/**
 * GET /api/schemes/category/:category
 * Get schemes by category
 */
const getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const schemes = await Scheme.getByCategory(category);

    res.json({ success: true, data: schemes, total: schemes.length });
  } catch (error) {
    logger.error('getByCategory error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch schemes by category' });
  }
};

/**
 * POST /api/schemes/match
 * Smart matching of schemes based on user profile
 */
const matchSchemes = async (req, res) => {
  try {
    const { error, value } = matchSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const userProfile = value;
    const schemes = await Scheme.find({ status: 'active' });

    // Score each scheme
    const results = schemes
      .map(scheme => {
        const eligibility = scheme.checkEligibility(userProfile);
        return {
          scheme,
          ...eligibility,
          matchPercentage: eligibility.percentage
        };
      })
      .filter(r => r.eligible || r.matchPercentage >= 50)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 10);

    res.json({
      success: true,
      data: results,
      profile: userProfile,
      totalMatched: results.length
    });
  } catch (error) {
    logger.error('matchSchemes error:', error);
    res.status(500).json({ success: false, error: 'Failed to match schemes' });
  }
};

module.exports = {
  getAllSchemes,
  getStats,
  getCategories,
  getSchemeById,
  getByCategory,
  matchSchemes
};
