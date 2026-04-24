import prisma from '@/src/lib/prisma';

export const SUBSCRIPTION_LIMITS = {
  FREE: {
    weeklyCredits: 40,
    creditsPerImage: 1,
    resolutionMultiplier: true,
    maxWidth: 1280,
    maxHeight: 720,
    canUseAdvancedModels: true,
    canShareToCommunity: true,
    canUseBatchGeneration: false,
    watermarkRequired: false,
    canAccessHighResModels: false,
    prioritySupport: false,
    monthlyPrice: 0,
    creditResetDays: 7,
  },
  STARTER: {
    weeklyCredits: 200,
    creditsPerImage: 1,
    resolutionMultiplier: true,
    maxWidth: 1536,
    maxHeight: 1024,
    canUseAdvancedModels: true,
    canShareToCommunity: true,
    canUseBatchGeneration: false,
    watermarkRequired: false,
    canAccessHighResModels: false,
    prioritySupport: false,
    monthlyPrice: 9,
    creditResetDays: 7,
  },
  PRO: {
    weeklyCredits: 500,
    creditsPerImage: 1,
    resolutionMultiplier: true,
    maxWidth: 1980,
    maxHeight: 1280,
    canUseAdvancedModels: true,
    canShareToCommunity: true,
    canUseBatchGeneration: true,
    watermarkRequired: false,
    canAccessHighResModels: true,
    prioritySupport: true,
    monthlyPrice: 29,
    creditResetDays: 7,
  },
  ENTERPRISE: {
    weeklyCredits: Infinity,
    creditsPerImage: 1,
    resolutionMultiplier: true,
    maxWidth: 1980,
    maxHeight: 1280,
    canUseAdvancedModels: true,
    canShareToCommunity: false,
    canUseBatchGeneration: true,
    watermarkRequired: false,
    canAccessHighResModels: true,
    prioritySupport: true,
    monthlyPrice: 99,
    creditResetDays: 7,
  },
};

export const CREDIT_PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: '$0',
    credits: 40,
    description: 'Perfect for trying out the platform',
    features: ['40 credits/week', 'Standard resolution (720p)', 'Community gallery'],
  },
  {
    id: 'STARTER',
    name: 'Starter',
    price: '$9/week',
    credits: 200,
    description: 'For casual creators',
    features: ['200 credits/week', 'HD resolution (1024p)', 'Share to community', 'No watermarks'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$29/week',
    credits: 500,
    description: 'For serious artists',
    features: ['500 credits/week', 'Full HD (1280p)', 'Batch generation', 'Priority support', 'Commercial license'],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: '$99/mo',
    credits: 'Unlimited',
    description: 'For teams & business',
    features: ['Unlimited credits', 'Full HD (1280p)', 'Dedicated support', 'Multi-user access', 'Custom integrations'],
  },
];

export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 500,
    price: '$29',
    features: ['500 one-time credits', 'Standard GPU priority', '4K exports'],
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 2500,
    price: '$99',
    features: ['2500 one-time credits', 'Ultra-HD GPU priority', '8K exports', 'Priority support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 10000,
    price: '$299',
    features: ['10000 one-time credits', 'Dedicated compute node', 'Custom model training', 'Multi-user'],
  },
];

export function calculateCreditCost(width, height, model = 'seredityfy-v2') {
  return 8;
}

export async function checkUserPermissions(userId, width = 1280, height = 720, model = 'seredityfy-v2') {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
    },
  });

  if (!user) {
    return {
      canGenerate: false,
      error: 'User not found',
      credits: 0,
      usedCredits: 0,
      availableCredits: 0,
    };
  }

  const subscription = user.subscription;
  const plan = subscription?.plan || 'FREE';
  const limits = SUBSCRIPTION_LIMITS[plan];
  const billingCycle = subscription?.billingCycle || 'WEEKLY';
  const resetDays = billingCycle === 'MONTHLY' ? 30 : 7;

  const maxCredits = limits.weeklyCredits;
  const usedCredits = subscription?.usedCredits || 0;

  let availableCredits = maxCredits;
  let nextResetDate = new Date();

  // Auto-renew: reset credits if the period has passed
  if (plan !== 'ENTERPRISE') {
    const resetDate = subscription?.creditResetDate || subscription?.createdAt;
    if (resetDate) {
      const now = Date.now();
      let resetTime = new Date(resetDate).getTime();

      if (now >= resetTime) {
        // Advance to the next cycle (handle multiple missed cycles)
        const cycleMs = billingCycle === 'MONTHLY'
          ? 30 * 24 * 60 * 60 * 1000
          : 7 * 24 * 60 * 60 * 1000;
        while (now >= resetTime) resetTime += cycleMs;

        availableCredits = maxCredits;
        nextResetDate = new Date(resetTime);

        await prisma.subscription.update({
          where: { userId },
          data: {
            usedCredits: 0,
            creditResetDate: nextResetDate,
          },
        });
      } else {
        availableCredits = Math.max(0, maxCredits - usedCredits);
        nextResetDate = new Date(resetDate);
      }
    }
  }

  const creditCost = calculateCreditCost(width, height, model);
  const canGenerate = plan === 'ENTERPRISE' || availableCredits >= creditCost;
  const remainingCredits = plan === 'ENTERPRISE' ? Infinity : Math.max(0, availableCredits - creditCost);

  const isApproved = subscription?.canSharePublic ?? true;

  return {
    canGenerate,
    plan,
    limits,
    billingCycle,
    credits: maxCredits === Infinity ? 999999 : maxCredits,
    usedCredits,
    availableCredits: remainingCredits,
    creditCost,
    isApproved,
    nextResetDate: nextResetDate.toISOString(),
    error: canGenerate ? null : 'Insufficient credits. Please upgrade your plan or purchase more credits.',
  };
}

export async function getVisibilityForUser(userId, requestedVisibility) {
  if (!userId) {
    return requestedVisibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE';
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
    },
  });

  if (!user) {
    return 'PRIVATE';
  }

  const plan = user.subscription?.plan || 'FREE';
  const limits = SUBSCRIPTION_LIMITS[plan];

  if (limits.canShareToCommunity === false) {
    return requestedVisibility || 'PRIVATE';
  }

  if (requestedVisibility === 'PRIVATE') {
    return 'PRIVATE';
  }

  return 'PUBLIC';
}

export async function canShareToCommunity(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
    },
  });

  if (!user) {
    return false;
  }

  const plan = user.subscription?.plan || 'FREE';
  const limits = SUBSCRIPTION_LIMITS[plan];

  return limits.canShareToCommunity;
}

export async function getCommunityImages(options = {}) {
  const { 
    page = 1, 
    limit = 20, 
    category, 
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  const where = {
    visibility: 'PUBLIC',
    status: 'COMPLETED',
    isApproved: true,
  };

  if (category) {
    where.metadata = {
      path: ['category'],
      equals: category,
    };
  }

  const [images, total] = await Promise.all([
    prisma.generatedImage.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.generatedImage.count({ where }),
  ]);

  return {
    images,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateImageVisibility(imageId, userId, visibility) {
  const image = await prisma.generatedImage.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    return { success: false, error: 'Image not found' };
  }

  if (image.userId !== userId) {
    return { success: false, error: 'Not authorized' };
  }

  const canShare = await canShareToCommunity(userId);
  
  if (visibility === 'PUBLIC' && !canShare) {
    return { 
      success: false, 
      error: 'Your plan does not allow sharing to community. Upgrade to PRO or ENTERPRISE to share your creations.' 
    };
  }

  const updated = await prisma.generatedImage.update({
    where: { id: imageId },
    data: { visibility },
  });

  return { success: true, image: updated };
}

export default {
  checkUserPermissions,
  getVisibilityForUser,
  canShareToCommunity,
  getCommunityImages,
  updateImageVisibility,
  SUBSCRIPTION_LIMITS,
  CREDIT_PLANS,
  CREDIT_PACKAGES,
  calculateCreditCost,
};
