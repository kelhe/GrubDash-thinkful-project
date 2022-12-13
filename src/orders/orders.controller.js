const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
const bodyHas = require("../utils/bodyHas");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res) {
  res.send({ data: orders });
}

function validateDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (Array.isArray(dishes) && dishes.length >= 1) {
    next();
  } else {
    next({ status: 400, message: "Order must include at least one dish" });
  }
}

function validateDishesInArray(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  dishes.forEach((dish, idx) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      typeof dish.quantity !== "number"
    ) {
      return next({
        status: 400,
        message: `Dish ${idx} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  next();
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).send({ data: newOrder });
}

function foundOrder(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  } else {
    next({ status: 404, message: `Order does not exist: ${orderId}` });
  }
}

function read(req, res) {
  res.send({ data: res.locals.order });
}

function validateStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  const validStatuses = [
    "pending",
    "preparing",
    "out-for-delivery",
    "delivered",
  ];
  if (!validStatuses.includes(status)) {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }
  if (status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }
  next();
}

function checkOrderId(req,res,next){
    const {orderId} = req.params
    const {data : {id}} = req.body
    if(id){
        orderId === id ? next() : next({status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`})
    } else {
        next();
    }
}

function update(req, res) {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;
  const foundOrder = res.locals.order;
  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;
  res.send({ data: foundOrder });
}

function validateDeleteStatus(req, res, next) {
  const status = res.locals.order.status;
  if (status !== "pending") {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  } else {
    next();
  }
}

function destroy(req, res) {
  const index = orders.findIndex((order) => order.id === res.locals.order.id);
  orders.splice(index, 1);
  res.status(204).send({ data: {} });
}

module.exports = {
  list,
  create: [
    bodyHas("deliverTo"),
    bodyHas("mobileNumber"),
    bodyHas("dishes"),
    validateDishes,
    validateDishesInArray,
    create,
  ],
  read: [foundOrder, read],
  update: [
    foundOrder,
    bodyHas("deliverTo"),
    bodyHas("mobileNumber"),
    bodyHas("status"),
    bodyHas("dishes"),
    validateDishes,
    validateDishesInArray,
    validateStatus,
    checkOrderId,
    update,
  ],
  delete: [foundOrder, validateDeleteStatus, destroy],
};
