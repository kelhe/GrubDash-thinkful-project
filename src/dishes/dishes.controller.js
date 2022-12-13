const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const validatePrice = require("../utils/validatePrice");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req,res){
    res.send({data : dishes})
}

function bodyHas(propertyName){
    return function (req,res,next){
        const {data = {}} = req.body;
        if(data[propertyName]){
            return next();
        }
        next({status: 400, message : `Dish must include a ${propertyName}`})
    }
}


function create(req,res){
const {data: {name,description,price,image_url} = {}} = req.body 
const newDish = {
    id : nextId(),
    name,
    description,
    price,
    image_url,
 }
 dishes.push(newDish)
 res.status(201).send({data: newDish})
}

function foundDish(req,res,next){
    const {dishId} = req.params
    const foundDish = dishes.find((dish)=> dish.id === dishId)
    if(foundDish){
        res.locals.dish = foundDish
        next()
    } else {
        next({status: 404, message: `Dish does not exist: ${dishId}`})
    }
}

function read(req,res){
    res.send({data: res.locals.dish})
}

function checkDishId(req,res,next){
    const {dishId} = req.params
    const {data : {id}} = req.body
    if(id){
        dishId === id ? next() : next({status: 400, message: `Dish id does not match route id. Order: ${id}, Route: ${dishId}`})
    } else {
        next();
    }
}

function update(req,res, next){
    const {data : {name,description,price,image_url}} = req.body
    const foundDish = res.locals.dish
    foundDish.name = name
    foundDish.description = description
    foundDish.price = price
    foundDish["image_url"] = image_url
    res.send({data : foundDish})
}



module.exports = {
    list,
    create : [
        bodyHas("name"),
        bodyHas("description"),
        bodyHas("price"),
        bodyHas("image_url"),
        validatePrice,
        create],
    read: [foundDish, read],
    update:[
    foundDish,
    checkDishId,
    bodyHas("name"),
    bodyHas("description"),
    bodyHas("price"),
    bodyHas("image_url"),
    validatePrice,
    update]}