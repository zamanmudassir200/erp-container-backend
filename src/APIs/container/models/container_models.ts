import { Schema, model } from "mongoose";

const ContainerSchema = new Schema({
  container_type: String,
  weight: Number,
  containers: [
    {
      quantity: Number,
      size: String,
    },
  ],
  price: Number,
  handle_type: String,
  sender_details: {
    name: String,
    email: String,
    phone: String,
  },
  receiver_details: {
    name: String,
    address: String,
    country_code: String,
    phone: String,
  },
  installmentDetails: [
    {
      installment_number: {
        type: Number,
      },
      amount: {
        type: Number,
      },
      status: {
        type: String,
        default: "pending",
      },
      due_date: {
        type: Date,
        default: function (this: any) {
          // If status is 'paid', return undefined (no due date)
          if (this.status === "paid") return undefined;
          // Else, set the due date to 1 month from the current date
          return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 month from current date
        },
      },
    },
  ],
  remaining_amount: {
    type: Number,
    default: function (this: any) {
      return this.price - this.installmentDetails[0].amount;
    },
  },
  tracking_status: {
    type: String,
    enum: ["Booked", "Pickup", "In-Transit", "Delivered"],
    default: "Booked",
  },
  tracking_stages: {
    pickup: {
      status: { type: Boolean, default: false },
      timestamp: {
        type: Date,
        default: function () {
          return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        },
      },
    },
    inTransit: {
      status: { type: Boolean, default: false },
      timestamp: {
        type: Date,
        default: function () {
          return new Date(Date.now() + 30 * 24 * 60 * 60 * 2000);
        },
      },
    },
    delivered: {
      status: { type: Boolean, default: false },
      timestamp: {
        type: Date,
        default: function () {
          return new Date(Date.now() + 30 * 24 * 60 * 60 * 3000);
        },
      },
    },
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = model("Container", ContainerSchema);
