const { AdminUser, GeminiUserSetting } = require('../../utils/db/models');

const CACHE_ADMINS = [{ id: "691246997646213131", username: "samiker"}];

const requireAuth = async (req, res, next) => {
    if (!req.user) return res.redirect('/login');
    
    if (CACHE_ADMINS.some(admin => admin.id === req.user.id)) {
        return next();
    }
    
    const isAdmin = await AdminUser.findByPk(req.user.id);
    if (!isAdmin) {
        return res.status(403).json({ status: 403, message: "You are not an admin" });
    }
    next();
};

const requireGeminiAccess = async (req, res, next) => {
    if (!req.user) return res.status(401).json({ status: 401, message: "Unauthorized" });
    
    const hasAccess = await GeminiUserSetting.findByPk(req.user.id);
    if (!hasAccess) {
        return res.status(403).json({ status: 403, message: "You are not in the database. Use /ai add-apikey to access." });
    }
    next();
};

module.exports = { requireAuth, requireGeminiAccess, CACHE_ADMINS };