function bodyHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({ status: 400, message: `Order must include a ${propertyName}` });
    };
  }

  module.exports = bodyHas