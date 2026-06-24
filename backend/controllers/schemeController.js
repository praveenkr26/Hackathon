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
      featured,
      sort = '-featured -viewCount'
    } = req.query;

    const query = { status };
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';

    let schemesQuery;

    if (search && search.trim()) {
      try {
        schemesQuery = Scheme.find({ ...query, $text: { $search: search } })
          .sort({ score: { $meta: 'textScore' } });
      } catch {
        schemesQuery = Scheme.find({
          ...query,
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ]
        }).sort(sort);
      }
    } else {
      schemesQuery = Scheme.find(query).sort(sort);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Scheme.countDocuments(query);
    const schemes = await schemesQuery.skip(skip).limit(parseInt(limit));

    res.json({
      success: true,
      data: schemes,
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
    const [totalActive, categoryStats, featuredCount] = await Promise.all([
      Scheme.countDocuments({ status: 'active' }),
      Scheme.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Scheme.countDocuments({ featured: true })
    ]);

    res.json({
      success: true,
      data: {
        totalSchemes: totalActive,
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
    const categories = await Scheme.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories.map(c => ({ category: c._id, count: c.count }))
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
    const scheme = await Scheme.findById(id);

    if (!scheme) {
      return res.status(404).json({ success: false, error: 'Scheme not found' });
    }

    // Increment view count
    await Scheme.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    res.json({ success: true, data: scheme });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: 'Invalid scheme ID' });
    }
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
