var db = require('../config/connection')
var collection = require('../config/collections');
const bcrypt = require('bcrypt')
const { response } = require('express');
var objectId = require('mongodb').ObjectId
// const password = require("bcrypt").hash("123", 10)
        
module.exports = {
    
    doLogin:(adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
            if(admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if (status) {
                        console.log('Success')
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('failed');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('failed');
                resolve({ status: false })
            }
        })
    },
    addProduct:(product,callback)=>{
        console.log(product);

        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data)
            callback(data.insertedId)
        })
    },
    getAllProducts:()=>{
        // console.log("password is",password);
        return new Promise(async(resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response)=>{
                // console.log(response);
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(prodId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(prodId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Color:proDetails.Color,
                    Capacity:proDetails.Capacity,
                    Price:proDetails.Price,
                    Category:proDetails.Category
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orderitems = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            // console.log(orders);
            resolve(orderitems)
        })
    },
    changeOrderStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(orderId)},
            {
                $set:{
                    status:'shipped'
                }
            }
            ).then(()=>{
                resolve()
            })
        })
    },
    viewAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let allUsers = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            console.log(allUsers);
            resolve(allUsers)
        })
    }
}