const { response } = require('express');
var express = require('express');
const { deleteAllProducts } = require('../helpers/product-helpers');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')


const verifyLogin=(req,res,next)=>{
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin/admin-login')
  }
}
/* GET users listing. */
router.get('/', function(req, res, next) {
  let admin = req.session.admin
 productHelpers.getAllProducts().then((products)=>{
  // console.log("admin is :",req.session.admin);
  // console.log(products)
  if(admin){
    res.render('admin/view-products',{admin:true,admin,products})
  }else{
    res.render('admin/admin-login')
  }
 })
});
router.get('/admin-login',(req,res)=>{
  if(req.session.admin){
    res.render('/admin/',{admin:true})
  }else{
    res.render('admin/admin-login',{"loginErr":req.session.adminLoginErr})
    req.session.adminLoginErr = false 
  }
})
router.post('/admin-login',(req,res)=>{
  productHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.admin=response.admin
      req.session.admin.loggedIn = true
      res.redirect('/admin/')
    }else{
      req.session.adminLoginErr = "Invalid Email or Password..."
      res.redirect('/admin/admin-login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.admin = null
  res.redirect('/admin/admin-login')
})
router.get('/add-product',verifyLogin,function(req,res){
  let admin = req.session.admin
  res.render('admin/add-product',{admin:true,admin})
})
router.post('/add-product',(req,res)=>{
  // console.log(req.body)
  // console.log(req.files.Image)
  productHelpers.addProduct(req.body,(id)=>{
    // console.log(id)
    let image = req.files.Image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('admin/add-product') 
      }else{
        console.log(err);
      }
    })
  })
})
router.get('/delete-product/:id',(req,res)=>{
  let proId = req.params.id
  // console.log(proId)
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
})
router.get('/edit-product/:id',verifyLogin,async(req,res)=>{
  let admin = req.session.admin
  let proId = req.params.id
  let product = await productHelpers.getProductDetails(proId)
  // console.log(product)
  res.render('admin/edit-product',{admin:true,admin,product})
})
router.post('/edit-product/:id',(req,res)=>{
  let id = req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let image = req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
    }
  })
})
router.get('/change-order-status',verifyLogin,(req,res,next)=>{
    let admin = req.session.admin
    productHelpers.getAllOrders().then((orderitems)=>{
    // console.log(orderitems);
    res.render('admin/change-order-status',{admin:true,admin,orderitems})
  })
})
router.get('/status-change/:id',(req,res)=>{
  let orderId = req.params.id
  // console.log(orderId)
  productHelpers.changeOrderStatus(orderId).then((response)=>{
    res.redirect('/admin/change-order-status')
  })
})
router.get('/view-users',verifyLogin,(req,res)=>{
  let admin = req.session.admin
  productHelpers.viewAllUsers().then((allUsers)=>{
    res.render('admin/view-users',{admin:true,admin,allUsers})
  })
})

module.exports = router;
