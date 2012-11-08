
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: '人間性ワンダーランド', user: req.user });
};
