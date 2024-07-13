const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController')
const productController = require('../controllers/productController')
const { requireAuth, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const orderController = require('../controllers/orderController')
//all routes to render shopping page 
router.get('/',(req, res) => {
    res.render('index');
});
router.get('/about',(req, res) => {
    res.render('about');
});
router.get('/random',(req, res) => {
    res.render('random');
});
router.get('/shop',(req, res) => {
    res.render('shop');
});
router.get('/cart',(req, res) => {
    res.render('cart');
});
// router.get('/checkout',(req, res) => {
//     res.render('checkout');
// });
router.get('/contact',(req, res) => {
    res.render('contact');
});
router.get('/index',(req, res) => {
    res.render('index');
});
router.get('/shop-single/id:',(req, res) => {
    res.render('shop-single');
});
router.get('/thankyou',(req, res) => {
    res.render('thankyou');
});
router.get('/addproductpage',(req, res) => {
    res.render('addproductpage');
});
// end of the shopping pages

// Route to render the html pages 


router.get('/homepage',requireAuth,(req, res) => {
    res.render('home');
});


router.get('/adminloginpage',  (req, res) => {
    res.render('adminlogin');
});

router.get('/adminsinguppage',  (req, res) => {
    res.render('adminsingup');
});

router.get('/adduser',  (req, res) => {
    res.render('adduser');
});
// router.get('/adminspage',  (req, res) => {
//     res.render('adminpage');
// });

router.get('/demo', requireAuth,isAdmin,  (req, res) => {
    res.render('demo');
});

router.get('/ecom-checkout',  (req, res) => {
    res.render('ecom-checkout');
});
router.get('/ecom-customers',  (req, res) => {
    res.render('ecom-customers');
});
router.get('/ecom-invoice',  (req, res) => {
    res.render('ecom-invoice');
});
router.get('/ecom-product-detail',  (req, res) => {
    res.render('ecom-product-detail');
});

// router.get('/ecom-product-grid',  (req, res) => {
//     res.render('ecom-product-grid');
// });
// router.get('/ecom-product-order',  (req, res) => {
//     res.render('ecom-product-order');
// });
router.get('/ecom-product-list',  (req, res) => {
    res.render('ecom-product-list');
});

// Route to handle for controller

router.get('/adminpage', requireAuth,isAdmin, adminController.fetchUserData);

router.post('/adminsignup', adminController.signup );
router.post('/adminlogin', adminController.login);
router.route('/adminlogout').post(adminController.logout);

router.delete('/users/:userId',adminController.deleteData)
router.get('/updateuser/:userId',adminController.updateuser)

router.post('/userupdate/:userId',adminController.userUpdate)


// all produnct related routes 
router.post('/addproduct', upload.single('productImage'), productController.uploadProduct);
router.get('/getproducts',productController.getproducts)
router.get('/getproduct/:id',productController.getproduct)
router.post('/cart',productController.addTocart)
router.get('/cartpage',productController.cartpage)
router.delete('/removefromcart/:id',productController.removefromcart)
router.get('/checkout', productController.chekoutdata);
router.post('/placeorder',productController.placeorder)
router.get('/admin-ecom-customers', requireAuth,isAdmin, adminController.fetchUserDatademo);
router.get('/admin-ecom-order', requireAuth,isAdmin, orderController.fetchOrderData);
router.delete('/order/:orderId', requireAuth,isAdmin,orderController.deleteOrder)
router.post('/order/:orderId/status', requireAuth,isAdmin, orderController.updateOrderStatus)
// routes/orders.js
// Add this route to the same file

// Get order status
// router.get('/order/:orderId/status',orderController.getOrderStatus)
router.get('/ecom-product-grid', requireAuth,isAdmin,productController.admingetproducts  );
router.delete('/product/:productId', requireAuth,isAdmin,productController.deleteProduct)

router.get('/productsbyprice', productController.productByPrice);





module.exports = router;

