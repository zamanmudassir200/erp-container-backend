import { error } from 'console';
import service from '../service/service';

const Stripe = require('stripe');
const stripe = new Stripe(
  'sk_test_51QPhZID0nPeKrajIN2Adi7XnUIHz52kAKBkTO9P2nygfQstOgnSLeMgnKTi85nemDr4j2E07YszwIrLXOgye34ip00vWUaKZpe'
);

export default {
  payment_stripe: async (body: any) => {
    try {
      const { down_payment } = body;
      // Create a Payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(down_payment * 100), // Stripe accepts amounts in cents
        currency: 'usd', // Adjust currency as needed
        automatic_payment_methods: {
          enabled: true, // Enables automatic handling for payment methods
        },
      });
      console.log(paymentIntent);
      if (!paymentIntent) {
        throw new Error('Failed to create payment intent');
      }
      return paymentIntent;
    } catch (e) {
      console.log(e);
      throw error;
    }
  },
  fiter_orders: async (body: any) => {
    try {
      const filters: Record<string, any> = {};
      const {
        container_type,
        weight,
        'containers.size': containerSize,
        price,
        handle_type,
        tracking_status,
        'installmentDetails.status': installmentStatus,
      } = body;

      // Add filters dynamically if they exist in the request query
      if (container_type) filters.container_type = container_type;
      if (weight) filters.weight = Number(weight); // Ensure correct type
      if (containerSize) filters['containers.size'] = containerSize;
      if (price) filters.price = Number(price);
      if (handle_type) filters.handle_type = handle_type;
      if (tracking_status) filters.tracking_status = tracking_status;
      if (installmentStatus)
        filters['installmentDetails.status'] = installmentStatus;

      if (body.startDate || body.endDate) {
        filters.created_at = {};
        if (body.startDate) {
          filters.created_at.$gte = new Date(body.startDate); // Greater than or equal to startDate
        }
        //   if (body.endDate) {
        //     filters.created_at.$lte = new Date(body.endDate); // Less than or equal to endDate
        //   }
      }

      const get_filter = await service.find_filter_orders(filters);
      return get_filter;
    } catch (e: any) {
      console.log(e);
      throw error;
    }
  },
};
