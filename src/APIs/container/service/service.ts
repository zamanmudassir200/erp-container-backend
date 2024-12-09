const Contaier_BD = require("../models/container_models");
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import fs from "fs";
import { registerClient } from "../../client/services/clientService";
import { generateRandomPassword } from "../../client/automateRegistration/generateClient";
import { IClientInput } from "../../client/models/clientModel";

const generatePDF = (container: any, pdfPath: string) => {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    doc.fontSize(16).text("Booking Confirmation", { align: "center" });
    doc.text("\n");
    doc.fontSize(12).text(`Booking ID: ${container._id}`);
    doc.text(`Container Type: ${container.container_type}`);
    doc.text(`Weight: ${container.weight}`);
    doc.text(`Price: ${container.price}`);
    doc.text(`Tracking Status: ${container.tracking_status}`);
    doc.text(`\nReceiver Details:`);
    doc.text(`Name: ${container.receiver_details.name}`);
    doc.text(`Address: ${container.receiver_details.address}`);
    doc.text(`Phone: ${container.receiver_details.phone}`);
    doc.text("\nThank you for choosing our service!");

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

const sendEmailWithPDF = async (pdfPath: string, recipientEmail: string) => {
  // Configure Nodemailer
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Use your email service provider (e.g., Gmail, Outlook)
    auth: {
      user: "khansuzair1@gmail.com", // Replace with your email
      pass: "yena sysp bncd uwvz", // Replace with your email password or app-specific password
    },
  });

  // Email options
  const mailOptions = {
    from: "khansuzair1@gmail.com", // Sender address
    to: recipientEmail, // Recipient email address
    subject: "Booking Confirmation PDF",
    text: "Please find the booking confirmation attached as a PDF.",
    attachments: [
      {
        filename: pdfPath.split("\\").pop(), // Get the filename from the path
        path: pdfPath, // Attach the generated PDF
      },
    ],
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

export default {
  save_book_conatiner: async (body: any) => {
    try {
      const newBody = { ...body };
      const container = new Contaier_BD(newBody); // Ensure `ContainerModel` is imported correctly
      const saveCont = await container.save();
      if (!saveCont) {
        throw new Error("Failed to book container");
      }

      // Generate PDF and send email
      const pdfDir = "D:\\New_ERP_Containers\\erp\\src\\APIs\\container\\pdfs";
      const pdfFileName = `booking_${container._id}.pdf`;
      const pdfPath = `${pdfDir}\\${pdfFileName}`;

      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      await generatePDF(container, pdfPath);
      await sendEmailWithPDF(pdfPath, container.sender_details.email);

      // Create client login
      const clientData: IClientInput = {
        username: container.sender_details.name,
        email: container.sender_details.email,
        phone: container.sender_details.phone,
        password: generateRandomPassword(),
      };

      if (
        !container.sender_details?.email ||
        !container.sender_details?.name ||
        !container.sender_details?.phone
      ) {
        throw new Error("Sender details are incomplete");
      }

      const newClient = await registerClient(clientData);

      return { container: saveCont, client: newClient };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  update_book_conatiner_tracking: async (body: any, id: any) => {
    try {
      const { tracking_status, tracking_stages } = body;
      const container = await Contaier_BD.findById(id);
      if (!container) {
        throw new Error("Container not found");
      }

      // Update the tracking status and tracking stages
      container.tracking_status = tracking_status || container.tracking_status;

      // If tracking stages are provided, update them as well
      if (tracking_stages) {
        container.tracking_stages = {
          pickup: tracking_stages.pickup || { status: false, timestamp: null },
          inTransit: tracking_stages.inTransit || {
            status: false,
            timestamp: null,
          },
          delivered: tracking_stages.delivered || {
            status: false,
            timestamp: null,
          },
        };
      }

      // Save the updated container
      const updated = await container.save();
      return updated;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  get_container_details: async (user_id: any) => {
    try {
      const get_data = await Contaier_BD.find({ sender_id: user_id });
      if (!get_data) {
        throw new Error(`No Contaier History `);
      }
      return get_data;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  // get_all_orders_container: async () => {
  //   try {
  //     const get_all_orders = await Contaier_BD.find({});
  //     if (!get_all_orders) {
  //       throw new Error("No Containers found");
  //     }
  //     return get_all_orders;
  //   } catch (e) {}
  // },
  get_all_orders_container: async () => {
    try {
      const get_all_orders = await Contaier_BD.find({});
      if (!get_all_orders) {
        throw new Error("No Containers found");
      }
      return get_all_orders;
    } catch (e) {
      console.error(e); // Log the error
      return []; // Return a default value like an empty array
    }
  },

  find_filter_orders: async (filter_body: any) => {
    try {
      const get_all_orders = await Contaier_BD.find(filter_body);
      if (!get_all_orders) {
        throw new Error("No Orders found");
      }
      return get_all_orders;
    } catch (error) {
      throw error;
    }
  },
  update_client_installment: async (body: any) => {
    try {
      const { containerId, installmentId, amount } = body;
      // Validate inputs
      if (!containerId || !installmentId || !amount) {
        throw new Error("Missing required fields.");
      }

      // Find the container by ID
      const container = await Contaier_BD.findById(containerId);
      if (!container) {
        throw new Error("Container not found.");
      }

      // Find the specific installment by ID
      const installment = container.installmentDetails.id(installmentId);
      if (!installment) {
        throw new Error("Installment not found.");
      }

      installment.status = "paid";
      installment.due_date = undefined; // Remove due date if paid

      // Update the remaining amount
      container.remaining_amount -= amount;
      if (container.remaining_amount < 0) container.remaining_amount = 0;

      // Save the updated container
      const updated_installment = await container.save();

      return updated_installment;
    } catch (error: any) {
      throw error;
    }
  },
};
