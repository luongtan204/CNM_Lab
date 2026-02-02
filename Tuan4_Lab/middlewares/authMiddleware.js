async function attachUser(req, res, next) {
  const sessionUser = req.session?.user;
  if (sessionUser && !req.user) {
    req.user = sessionUser;
  }
  res.locals.currentUser = req.user || null;
  next();
}

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  next();
}

function requireRoles(roles = []) {
  return (req, res, next) => {
    const user = req.session?.user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).render('unauthorized', { message: 'You do not have permission to access this resource.' });
    }
    next();
  };
}

function consumeFlash(req, res, next) {
  res.locals.flash = req.session?.flash || null;
  if (req.session) {
    delete req.session.flash;
  }
  next();
}

module.exports = { attachUser, requireAuth, requireRoles, consumeFlash };
