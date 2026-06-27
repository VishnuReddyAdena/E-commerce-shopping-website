import Razorpay from 'razorpay';
import crypto from 'crypto';

const isMockMode = !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;
if (!isMockMode) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (error) {
    console.error('Failed to initialize Razorpay client:', error.message);
  }
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body; // Amount in rupees or dollars (we multiply by 100 on frontend for paise/cents)

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid payment amount' });
  }

  try {
    if (isMockMode || !razorpayInstance) {
      // Simulate order response for fallback mock mode
      return res.status(200).json({
        id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
        amount: Math.round(amount * 100),
        currency: 'INR',
        isMock: true,
        key: 'rzp_test_mock_public_key_12345'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({
      ...order,
      key: process.env.RAZORPAY_KEY_ID,
      isMock: false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    if (isMockMode) {
      return res.status(200).json({
        success: true,
        message: 'Mock payment verified successfully'
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
