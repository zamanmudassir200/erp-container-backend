import { Schema, model, Document } from 'mongoose';

interface PaymentSchedule {
  installment_number: number;
  due_date: Date;
  amount: number;
  status: 'pending' | 'paid';
}

interface Payment extends Document {
  user_id  : Schema.Types.ObjectId;
  booking_id: Schema.Types.ObjectId;
  total_amount: number;
  down_payment: number;
  remaining_balance: number;
  installmentDetails: PaymentSchedule[];
  remaining_amount : number;
  created_at: Date;
}

const PaymentSchema = new Schema<Payment>({
  user_id : {
    type : Schema.Types.ObjectId,
    required : true
  },
  booking_id: {
    type: Schema.Types.ObjectId,
    ref: 'Container', // Reference to your container booking model
    required: true,
  },
  total_amount: {
    type: Number,
    required: true,
  },
  installmentDetails : [
    {
      installment_number :  {
        type  : Number,
      },
      amount : {
        type  : Number,
      },
      status : {
         type : String,
         default : 'pending'
      },
      due_date: {
        type: Date,
        default: function (this  : any) {
          // If status is 'paid', return undefined (no due date)
          if (this.status === 'paid') return undefined;
          // Else, set the due date to 1 month from the current date
          return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 month from current date
        }
      }
    }
  ],
  remaining_amount : {
    type : Number,
},
},{timestamps : true});

const PaymentModel = model<Payment>('Payment', PaymentSchema);

export default PaymentModel;
