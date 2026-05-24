// Middleware to check subscription status (for future premium features)
const checkSubscription = (requiredPlan = 'free') => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // For now, all users have free access
      // This can be extended for premium features
      const userPlan = user.subscriptionPlan || 'free';
      const planHierarchy = {
        free: 0,
        basic: 1,
        premium: 2,
        enterprise: 3,
      };

      if (planHierarchy[userPlan] >= planHierarchy[requiredPlan]) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `This feature requires a ${requiredPlan} plan or higher`,
        currentPlan: userPlan,
        requiredPlan,
      });
    } catch (error) {
      next(error);
    }
  };
};

module.exports = checkSubscription;