// Cash-only payment controller

// Process cash payment (no external processing needed)
export const processPayment = async (req, res) => {
  try {
    const { paymentMethod, amount } = req.body;

    if (paymentMethod !== 'cash' && paymentMethod !== 'mobile_banking') {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // For cash payments, no processing needed
    if (paymentMethod === 'cash') {
      return res.json({
        success: true,
        message: 'Cash payment confirmed',
        paymentMethod: 'cash'
      });
    }

    // For mobile banking, just confirm receipt
    if (paymentMethod === 'mobile_banking') {
      return res.json({
        success: true,
        message: 'Mobile banking payment confirmed',
        paymentMethod: 'mobile_banking'
      });
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get payment status (simplified for cash payments)
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // For cash payments, status is always confirmed
    res.json({
      status: 'confirmed',
      paymentMethod: 'cash'
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ message: error.message });
  }
};