/**
 * Role-Based Access Control Middleware
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function authorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true }
      });

      if (!user || (roles.length && !roles.includes(user.role))) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

module.exports = authorize;
