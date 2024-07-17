
const Order = require('../models/orderModel');
const Admin = require('../models/Admin');
const Product = require('../models/Productmodel');



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


    
module.exports={fetchOrderData,deleteOrder,updateOrderStatus,getOrderStatus}