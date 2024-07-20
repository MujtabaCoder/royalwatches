require('dotenv').config();
const Order = require('../models/orderModel');
const Admin = require('../models/Admin');
const Product = require('../models/Productmodel');
const { render } = require('ejs');
const easyinvoice = require('easyinvoice');
const crypto = require('crypto');
const Razorpay = require('razorpay');


const fetchOrderData = async (req, res) => {
  try {
    const orders = await Order.find();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    const orderDetails = await Promise.all(orders.map(async (order) => {
      try {
        const user = await Admin.findById(order.user);
        const products = await Promise.all(order.products.map(async (item) => {
          const product = await Product.findById(item.product);
          return {
            name: product.productName,
            quantity: item.quantity
          };
        }));

        const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const details = {
          user: user.fullName, // Assuming user name is stored in fullName
          orderid: order._id,
          products: products,
          totalPrice: order.totalPrice,
          shippingAddress: order.shippingAddress,
          orderStatus: order.orderStatus,
          orderDate: orderDate
        };
        // console.log(details);
        return details;
      } catch (err) {
        // console.error(`Error processing order ${order._id}:`, err);
        return null;
      }
    }));

    // Filter out any null results in case of errors
    const validOrderDetails = orderDetails.filter(details => details !== null);

    // console.log(validOrderDetails);

    res.render('ecom-product-order', { orders: validOrderDetails });
  } catch (error) {
    // console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
};



const deleteOrder = async (req,res)=>{

    const orderId = req.params.orderId;
  
    try {
       const deletedorder =  await Order.findByIdAndDelete(orderId);
        res.json({order: deletedorder}); 
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Failed to delete order.' });
    }

}

const updateOrderStatus = async (req,res)=>{
    const { orderId } = req.params;
    const { status } = req.body;
  
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus: status },
        { new: true }
      );
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
    //   res.json({ message: 'Order status updated successfully', order });
      res.redirect('/admin-ecom-order')
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
}

const getOrderStatus = async()=>{

    const { orderId } = req.params;
  
    try {
      const order = await Order.findById(orderId).populate('user').populate('products.product');
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.json({ orderStatus: order.orderStatus });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
}

// async function removefromcart(req, res) {
//   const productIdToRemove = req.params.id;
//   console.log('Product ID to remove:', productIdToRemove);

//   if (req.session.cart) {
//     console.log('Cart before removal:', JSON.stringify(req.session.cart, null, 2));
    
//     req.session.cart = req.session.cart.filter(item => {
//       if (item.product && item.product._id) {
//         return item.product._id.toString() !== productIdToRemove;
//       }
//       return true; // If item.product or item.product._id is undefined, keep the item in the cart
//     });

//     console.log('Cart after removal:', JSON.stringify(req.session.cart, null, 2));
//   }

//   res.status(200).json({ message: 'Product removed from cart' });
// }

const profiledata= async(req,res)=>{
  try {

    const user = await Admin.findById(req.session.userId);

    const userId = req.session.userId;
    const orders = await Order.find({ user: userId }).populate('user products.product');
    
    if (orders.length === 0) {
      return res.status(404).json({ status: 'No orders found for this user.' });
    }
  
    // Assuming you want to get the status of the most recent order
    const latestOrder = orders[orders.length - 1];
    const data = {
      username:user.fullName,
      mobileNO:user.mobileNumber,
      status: latestOrder.orderStatus,
      orderId:latestOrder._id
    }
    // console.log(data);


    res.render('profile',{data:data })
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
     
}

async function generateInvoice(order, user) {
  const invoiceData = {
    "images": {
      "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
      "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
    },
    "sender": {
      "company": "Shoppers",
      "address": "westrern park, Kashimira, miraroad(east)",
      "zip": "401107",
      "city": "Mumbai",
      "country": "India"
    },
    "client": {
      "company": user.fullName || "Client Corp", // Adjust as necessary
      "address": order.shippingAddress || "Clientstreet 456",
      "zip": user.mobileNumber || "4567 CD",
      // "city": user.city || "Clientcity",
      // "country": user.country || "Clientcountry"
    },
    "information": {
      "number": order._id,
      "date": new Date().toISOString().split('T')[0],
      "due-date": new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
    },
    "products": order.products.map(p => ({
      "quantity": p.quantity,
      "description": p.product.productName,
      "tax-rate": 0,
      "price": p.product.price
    })),
    "bottom-notice": "Thank you for your business."
  };

  const result = await easyinvoice.createInvoice(invoiceData);
  return result.pdf; // The base64 string of the invoice PDF
}

const downloadInvoice = async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findById(orderId).populate('products.product');
    if (!order) {
      return res.status(404).send('Order not found');
    }
    const user = await Admin.findById(order.user); // Assuming you have a User model

    if (!user) {
      return res.status(404).send('User not found');
    }
    // console.log(order);
    const pdfBase64 = await generateInvoice(order, user);
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating invoice:', err);
    res.status(500).send('Error generating invoice');
  }
}

const razorpayInstance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
});

const createOrder = async (req, res) => {
  const { amount, currency, receipt } = req.body;
  // console.log(amount, currency, receipt);

  try {
      const options = {
          amount: amount * 100, // Amount in paise (multiply by 100 for rupees)
          currency,
          receipt
      };

      const order = await razorpayInstance.orders.create(options);
      // console.log(order);
      res.json(order);
  } catch (error) {
      res.status(500).send(error);
  }
}

const verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  const hmac = crypto.createHmac('sha256', 'jg6cKF95rWoif59eb0xlAbCd');
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generated_signature = hmac.digest('hex');
//  console.log(generated_signature , razorpay_signature);
  if (generated_signature === razorpay_signature) {
      res.json({ success: true });
  } else {
      res.json({ success: false });
  }
}

module.exports={fetchOrderData,deleteOrder,updateOrderStatus,getOrderStatus,profiledata,downloadInvoice,createOrder,verifyPayment}