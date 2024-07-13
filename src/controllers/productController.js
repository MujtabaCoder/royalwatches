const productModel = require('../models/Productmodel')
const Order = require('../models/orderModel'); 

async function UploadProductController(req, res) {
    try {
    //   console.log(req.body); // Log the form data
    //   console.log('Uploaded file:', req.file); 
  
      const { productName, brandName, category, description, price, sellingPrice } = req.body;
      const productImage = req.file ? [req.file.path] : []; // Store the file path in an array
      
      const newProduct = new productModel({
        productName,
        brandName,
        category,
        description,
        price,
        sellingPrice,
        productImage
      });
  
      const saveProduct = await newProduct.save();
  
      res.status(201).json({
        message: "Product uploaded successfully",
        error: false,
        success: true,
        data: saveProduct
      });
    } catch (err) {
      console.error('Error:', err);
      res.status(400).json({
        message: err.message || err,
        error: true,
        success: false
      });
    }
  }

async function getproducts(req,res){
    try {
        const product = await  productModel.find()
        
      //  console.log(product)
        res.json(product)
    } catch (error) {
        res.status(500).json({massage:error.massage})
    }
}
function convertLocalPathToRelativeUrl(localPath) {
  const pathParts = localPath.split('\\');
  return '/uploads/' + pathParts[pathParts.length - 1];
}
async function getproduct (req,res){
    try {
        const productId = req.params.id;
        const product = await productModel.findById(productId);
        if (!product) {
          return res.status(404).send('Product not found');
        }
        product.productImage = convertLocalPathToRelativeUrl(product.productImage[0]);
        res.render('shop-single', { product });
      } catch (error) {
        res.status(500).send(error.message);
      }
}

async function addTocart(req,res){
    const { productId, quantity } = req.body;
  
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    const cart = req.session.cart;
    const existingProductIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingProductIndex !== -1) {
      cart[existingProductIndex].quantity += parseInt(quantity, 10);
    } else {
      cart.push({
        productId,
        quantity: parseInt(quantity, 10)
      });
    }
    
    req.session.cart = cart;
    res.json({ success: true });
}

async function cartpage(req, res) {
  try {
    const cart = req.session.cart; 
    
      // console.log(cart)

    if (!Array.isArray(cart)) {
    

      return res.status(400).send('No items in cart');
    }

    const productsInCart = [];

    for (const cartItem of cart) {
      const productId = cartItem.productId;
      const quantity = cartItem.quantity;

      const product = await productModel.findById(productId);

      if (product) {
        let productImage = convertLocalPathToRelativeUrl(product.productImage[0]);
        productsInCart.push({
          product: product,
          productImage: productImage,
          quantity: quantity,
        });
      }
    }

    // console.log('This is my cart:', productsInCart);

    res.render('cart', { productsInCart: productsInCart });productsInCart
  } catch (err) {
    console.error('Error fetching cart or product details:', err);
    res.status(500).send('Error fetching cart or product details');
  }
}

async function removefromcart(req,res){
    const productIdToRemove = req.params.id;
    // console.log(productIdToRemove)
     
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.productId !== productIdToRemove);
  }
  res.status(200).json({ message: 'Product removed from cart' });
}
async function chekoutdata(req,res){
  const productsInCart = JSON.parse(req.query.productsInCart);
    // console.log(productsInCart);
    res.render('checkout', { productsInCart: productsInCart });
}

async function placeorder(req, res) {
  try {
    if (!req.session.userId) {
      return res.redirect('/adminloginpage');
    }

    const { address, products, totalPrice } = req.body;

    const productsArray = JSON.parse(products);

    const order = new Order({
      user: req.session.userId, 
      products: productsArray.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      totalPrice: totalPrice,
      shippingAddress: address,
      orderStatus: 'Pending', 
      orderDate: Date.now() 
    });
    order.save()

    req.session.cart = [];

    res.redirect('/thankyou');
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).send('Error placing order');
  }
}

async function admingetproducts(req,res){
  try {
      const products = await  productModel.find()

      products.forEach(product => {
        if (product.productImage && product.productImage.length > 0) {
          product.productImage = product.productImage.map(imagePath => convertLocalPathToRelativeUrl(imagePath));
        }
      });

      // console.log(products)

    res.render('ecom-product-grid', { products });
  } catch (error) {
      res.status(500).json({massage:error.massage})
  }
}


const deleteProduct = async(req,res)=>{ 

  const productId = req.params.productId;

    try {
       const deletedproduct =  await productModel.findByIdAndDelete(productId);
        res.json({product: deletedproduct}); 
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user.' });
    }
}

const productByPrice = async(req,res)=>{
  try {
    // console.log(req.query)
    const { minPrice, maxPrice } = req.query;
    const query = {};

    if (minPrice !== undefined && maxPrice !== undefined) {
        query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    } else if (minPrice !== undefined) {
        query.price = { $gte: Number(minPrice) };
    } else if (maxPrice !== undefined) {
        query.price = { $lte: Number(maxPrice) };
    }

    const products = await productModel.find(query);
    // console.log(products)
    res.json(products);
} catch (err) {
    res.status(500).json({ error: err.message });
}

}
module.exports = {UploadProductController,getproducts,getproduct,addTocart,cartpage,removefromcart,chekoutdata,placeorder,admingetproducts,deleteProduct,productByPrice};