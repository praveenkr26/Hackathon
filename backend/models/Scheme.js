const mongoose = require('mongoose');

const EligibilitySchema = new mongoose.Schema({
  minAge: { type: Number, default: 0 },
  maxAge: { type: Number, default: 100 },
  gender: {
    type: String,
    enum: ['all', 'male', 'female', 'other'],
    default: 'all'
  },
  incomeLimit: { type: Number, default: null }, // Annual income in INR
  caste: {
    type: [String],
    enum: ['general', 'sc', 'st', 'obc', 'all'],
    default: ['all']
  },
  states: { type: [String], default: ['all'] },
  disabilities: { type: Boolean, default: false },
  maritalStatus: {
    type: String,
    enum: ['any', 'married', 'unmarried', 'widow', 'divorced'],
    default: 'any'
  },
  occupation: { type: [String], default: ['all'] }
}, { _id: false });

const BenefitSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['financial', 'scholarship', 'insurance', 'employment', 'housing', 'healthcare', 'education', 'pension', 'loan', 'subsidy'],
    required: true
  },
  amount: { type: Number, default: null },
  description: { type: String, required: true },
  frequency: {
    type: String,
    enum: ['one-time', 'monthly', 'quarterly', 'annually'],
    default: 'one-time'
  }
}, { _id: false });

const SchemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Scheme name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  nameHindi: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [10000, 'Description cannot exceed 10000 characters']
  },
  descriptionHindi: { type: String, maxlength: 10000 },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'education', 'health', 'agriculture', 'housing', 'employment',
      'social-welfare', 'women-empowerment', 'skill-development',
      'financial-inclusion', 'senior-citizen', 'disability', 'tribal-welfare'
    ]
  },
  ministry: { type: String, required: true },
  launchYear: { type: Number },
  deadline: { type: Date, default: null },
  status: {
    type: String,
    enum: ['active', 'closed', 'upcoming'],
    default: 'active'
  },
  eligibility: { type: EligibilitySchema, default: () => ({}) },
  benefits: { type: [BenefitSchema], default: [] },
  documents: {
    type: [String],
    default: []
  },
  applicationProcess: { type: String },
  applicationUrl: { type: String },
  helplineNumber: { type: String },
  tags: { type: [String], default: [] },
  viewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  imageUrl: { type: String, default: null }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ─── Indexes for performance ─────────────────────────────────────────────
SchemeSchema.index({ category: 1, status: 1 });
SchemeSchema.index({ tags: 1 });
SchemeSchema.index({ featured: 1 });
SchemeSchema.index({ name: 'text', description: 'text', tags: 'text' });

// ─── Auto-generate slug before saving ───────────────────────────────────
SchemeSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100) + '-' + Date.now();
  }
  next();
});

// ─── Instance Methods ────────────────────────────────────────────────────
SchemeSchema.methods.checkEligibility = function (userProfile) {
  const e = this.eligibility;
  const score = { eligible: true, reasons: [], matchScore: 0, maxScore: 6 };

  if (userProfile.age !== undefined) {
    if (userProfile.age >= e.minAge && userProfile.age <= e.maxAge) {
      score.matchScore++;
    } else {
      score.eligible = false;
      score.reasons.push(`Age ${userProfile.age} not in range ${e.minAge}-${e.maxAge}`);
    }
  }

  if (e.gender !== 'all' && userProfile.gender && userProfile.gender !== e.gender) {
    score.eligible = false;
    score.reasons.push(`Scheme is for ${e.gender} only`);
  } else {
    score.matchScore++;
  }

  if (e.incomeLimit && userProfile.income && userProfile.income > e.incomeLimit) {
    score.eligible = false;
    score.reasons.push(`Income ${userProfile.income} exceeds limit ${e.incomeLimit}`);
  } else {
    score.matchScore++;
  }

  if (!e.caste.includes('all') && userProfile.caste) {
    if (e.caste.includes(userProfile.caste.toLowerCase())) {
      score.matchScore++;
    } else {
      score.eligible = false;
      score.reasons.push('Caste category not eligible');
    }
  } else {
    score.matchScore++;
  }

  if (!e.states.includes('all') && userProfile.state) {
    if (e.states.includes(userProfile.state)) {
      score.matchScore++;
    } else {
      score.eligible = false;
      score.reasons.push(`State ${userProfile.state} not covered`);
    }
  } else {
    score.matchScore++;
  }

  score.percentage = Math.round((score.matchScore / score.maxScore) * 100);
  return score;
};

// ─── Static Methods ──────────────────────────────────────────────────────
SchemeSchema.statics.getByCategory = function (category) {
  return this.find({ category, status: 'active' }).sort({ featured: -1, viewCount: -1 });
};

SchemeSchema.statics.searchSchemes = function (query, filters = {}) {
  const searchQuery = { status: 'active', ...filters };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery)
    .sort(query ? { score: { $meta: 'textScore' } } : { featured: -1, viewCount: -1 })
    .limit(filters.limit || 20);
};

module.exports = mongoose.model('Scheme', SchemeSchema);
