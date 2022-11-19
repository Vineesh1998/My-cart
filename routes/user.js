const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
var userHelpers = require('../helpers/user-helpers');

const verifyLogin=(req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/',async function(req, res, next) {
  let user = req.session.user
  // console.log(user)
  let cartCount = null
  if(req.session.user){
  cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products',{products,user,cartCount})
   })
});
router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else{
    res.render('user/login',{"loginErr":req.session.userLoginErr})
    req.session.userLoginErr = false 
  }
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
  // console.log(response)
  req.session.user = response
  req.session.user.loggedIn = true
  res.render('user/login')
  })
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user
      req.session.user.loggedIn = true
      res.redirect('/')
    }else{
      req.session.userLoginErr = "Invalid Email or Password..."
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.user = null
  // req.session.user.loggedIn =false
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let user = req.session.user
  let products =await userHelpers.getCartProducts(req.session.user._id) 
  let totalAmount=0
  if(products.length>0){
  totalAmount = await userHelpers.getTotalAmount(req.session.user._id)
  }else{
    res.render('user/cart-status',{user})
  }
  res.render('user/cart',{products,users:req.session.user._id,totalAmount,user})
})
router.get('/add-to-cart/:id',(req,res)=>{
  // console.log('api call')
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})
router.get('/cart-status',verifyLogin,(req,res)=>{
  let user = req.session.user
  res.render('user/cart-status',{user})
})
router.post('/change-product-quatity',verifyLogin,(req,res,next)=>{
  // console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total =await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})
router.post('/remove-product',(req,res,next)=>{
  // console.log(req.body)
  userHelpers.removeProduct(req.body).then((response)=>{
    res.json(response)
  })
})
router.get('/place-order',verifyLogin,async(req,res)=>{
  let total =await userHelpers.getTotalAmount(req.session.user._id)
  console.log(total);
  res.render('user/place-order',{total,user:req.session.user})
})
router.post('/place-order',async(req,res)=>{
  let products =await userHelpers.getCartProductList(req.body.userId)
  let totalPrice =await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }
    else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }
  })
})
router.get('/order-success',async(req,res)=>{
  let orders =await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/order-success',{user:req.session.user,orders})
})
router.get('/order-address',verifyLogin,async(req,res)=>{
  let user = req.session.user
  let orders =await userHelpers.getUserOrders(req.session.user._id)
  if(orders.length>0){
    res.render('user/order-address',{user:req.session.user._id,orders,user})
  }else{
    res.render('user/order-status',{user})
  }
  
})
router.get('/order-details/:id',async(req,res)=>{
  let user = req.session.user
  console.log(req.params.id);
  let products =await userHelpers.getOrderProduct(req.params.id)
  res.render('user/order-details',{products,user})
})
router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:''})
  })
})


module.exports = router;
