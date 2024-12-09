// import { Request, Response } from "express";
// import service from "./service/service";
// import repo from "./repo/container_repo";
// import logger from "../../handlers/logger";

// export default {
//   // booking_container: async (req: Request, res: Response) => {
//   //   try {
//   //     if (!req.body) {
//   //       throw new Error("body not found");
//   //     }
//   //     const container_data = await service.save_book_conatiner(req.body);
//   //     logger.info(`container booked: `, { meta: container_data });
//   //     res.status(201).json({
//   //       message: "Container Booked Successfully",
//   //       data: container_data,
//   //     });
//   //   } catch (error: any) {
//   //     console.log(error);
//   //     logger.error(`error occured in controller : `, { meta: error });
//   //     res.status(400).json({ error: error?.message });
//   //   }
//   // },
//   booking_container: async (req: Request, res: Response) => {
//     try {
//       if (!req.body) {
//         logger.error(`the req.body is : `, { meta: req.body });
//         throw new Error("Body not found");
//       }
//       const { container, client } = await service.save_book_conatiner(req.body);
//       logger.info(`container booked: `, { meta: container });

//       res.status(201).json({
//         message: "Container Booked Successfully",
//         container,
//         client,
//       });
//     } catch (error: any) {
//       console.log(error);
//       logger.error(`the error is :`, { meta: error });
//       res.status(400).json({ error: error?.message });
//     }
//   },
//   payment_container: async (req: Request, res: Response) => {
//     try {
//       const paymentverify = await repo.payment_stripe(req.body);
//       res.status(200).json({
//         message: "Client Payment Secret",
//         data: paymentverify?.client_secret,
//       });
//     } catch (e: any) {
//       res.status(400).json({ error: e?.message });
//     }
//   },
//   booking_container_tracking: async (req: Request, res: Response) => {
//     try {
//       const { id } = req.params;
//       if (!req.body) {
//         throw new Error("body not found");
//       }
//       const a = await service.update_book_conatiner_tracking(req.body, id);
//       if (a) {
//         res
//           .status(200)
//           .json({ message: "Container Tracking Updated  Successfully" });
//       }
//     } catch (error: any) {
//       console.log(error);
//       res.status(400).json({ error: error?.message });
//     }
//   },
//   get_all_client_booking: async (req: Request, res: Response) => {
//     try {
//       const userid = req.authenticatedUser;
//       console.log("user ", userid);
//       const a = await service.get_container_details(userid._id);
//       res.status(200).json({ message: "All Client Booking Details", data: a });
//     } catch (e: any) {
//       console.log(e);
//       res.status(400).json({ error: e?.message });
//     }
//   },
//   get_all_orders_container: async (req: Request, res: Response) => {
//     try {
//       if (req) {
//       }
//       const a = await service.get_all_orders_container();
//       res
//         .status(200)
//         .json({ message: "All Orders Container Details", data: a });
//     } catch (e: any) {
//       console.log(e);
//       res.status(400).json({ error: e?.message });
//     }
//   },
//   get_filter_containers: async (req: Request, res: Response) => {
//     try {
//       console.log(req.body);
//       const get_filter = await repo.fiter_orders(req.body);
//       res.status(200).json({
//         message: "Filtered Orders Container Details",
//         data: get_filter,
//       });
//     } catch (e: any) {
//       console.log(e);
//       res.status(400).json({ error: e?.message });
//     }
//   },
//   update_installment_payment: async (req: Request, res: Response) => {
//     try {
//       const updated_installment = await service.update_client_installment(
//         req.body
//       );
//       res.status(200).json({
//         message: "Client Installment Updated Successfully",
//         data: updated_installment,
//       });
//     } catch (e: any) {
//       console.log(e);
//     }
//   },
// };

import { Request, Response } from "express";
import service from "./service/service";
import repo from "./repo/container_repo";
import logger from "../../handlers/logger";

interface BookingRequestBody {
  containerId: string;
  clientId: string;
  [key: string]: unknown; // Add additional fields as necessary
}

interface UpdateTrackingBody {
  trackingId: string;
  status: string;
  [key: string]: unknown;
}

export default {
  booking_container: async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as BookingRequestBody;
      if (!body) {
        logger.error("Request body is missing", { meta: req.body });
        res.status(400).json({ error: "Body not found" });
        return;
      }
      const { container, client } = await service.save_book_conatiner(body);
      logger.info("Container booked successfully", {
        meta: { container, client },
      });

      res.status(201).json({
        message: "Container Booked Successfully",
        container,
        client,
      });
    } catch (error) {
      logger.error("Error in booking container", { meta: error });
      res.status(400).json({ error: (error as Error).message });
    }
  },

  payment_container: async (req: Request, res: Response): Promise<void> => {
    try {
      const paymentData = req.body;
      if (!paymentData) {
        res.status(400).json({ error: "Payment data is required" });
        return;
      }
      const paymentVerify = await repo.payment_stripe(paymentData);
      res.status(200).json({
        message: "Client Payment Secret",
        data: paymentVerify?.client_secret,
      });
    } catch (error) {
      logger.error("Error in payment container", { meta: error });
      res.status(400).json({ error: (error as Error).message });
    }
  },

  booking_container_tracking: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const body = req.body as UpdateTrackingBody;
      if (!body) {
        res.status(400).json({ error: "Body not found" });
        return;
      }
      await service.update_book_conatiner_tracking(body, id);
      res.status(200).json({
        message: "Container Tracking Updated Successfully",
      });
    } catch (error) {
      logger.error("Error updating container tracking", { meta: error });
      res.status(400).json({ error: (error as Error).message });
    }
  },

  get_all_client_booking: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.authenticatedUser?._id;
      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }
      const bookings = await service.get_container_details(userId);
      res.status(200).json({
        message: "All Client Booking Details",
        data: bookings,
      });
    } catch (error) {
      logger.error("Error retrieving client bookings", { meta: error });
      res.status(400).json({ error: (error as Error).message });
    }
  },

  get_all_orders_container: async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const orders = await service.get_all_orders_container();
      res.status(200).json({
        message: "All Orders Container Details",
        data: orders,
      });
    } catch (error) {
      logger.error("Error retrieving all container orders", { meta: error });
      res.status(400).json({ error: (error as Error).message });
    }
  },

  get_filter_containers: async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = req.body;
      const filteredOrders = await repo.fiter_orders(filters);
      res.status(200).json({
        message: "Filtered Orders Container Details",
        data: filteredOrders,
      });
    } catch (error) {
      logger.error("Error retrieving filtered containers", { meta: error });
      res.status(400).json({ error: (error as Error).message });
    }
  },

  update_installment_payment: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const updatedInstallment = await service.update_client_installment(
        req.body
      );
      res.status(200).json({
        message: "Client Installment Updated Successfully",
        data: updatedInstallment,
      });
    } catch (error) {
      logger.error("Error updating installment payment", { meta: error });
      res.status(400).json({ error: (error as Error).message });
    }
  },
};
