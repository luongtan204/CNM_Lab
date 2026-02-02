const authService = require('../services/authService');

function renderLogin(req, res) {
  if (req.session?.user) {
    return res.redirect('/');
  }
  res.render('login', { error: null });
}

async function handleLogin(req, res) {
  const { username, password } = req.body;
  const user = await authService.login(username, password);
  if (!user) {
    return res.status(401).render('login', { error: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
  }

  req.session.user = user;
  req.session.flash = { type: 'success', message: `Xin chào ${user.username}` };
  res.redirect('/');
}

function handleLogout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}

module.exports = {
  renderLogin,
  handleLogin,
  handleLogout
};
