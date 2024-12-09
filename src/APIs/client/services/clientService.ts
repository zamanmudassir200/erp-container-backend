import {
  createClient,
  getClientByUsername,
} from "../repository/clientRepository";
import { IClient, IClientInput } from "../models/clientModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../../config/config";
import {
  generateUniqueUsername,
  generateRandomPassword,
  generateRandomString,
} from "../automateRegistration/generateClient";

// import logger from "../../../handlers/logger";
// Replace with your secret
const JWT_SECRET = config.TOKENS.ACCESS.SECRET;



export const registerClient = async (
  clientData: IClientInput
): Promise<IClient> => {
  let { username, password } = clientData;

  // Ensure username uniqueness
  username = await generateUniqueUsername(username);
  clientData.username = `${username}${generateRandomString(4, 7)}`;

  const existingClient = await getClientByUsername(clientData.username);
  if (existingClient) {
    throw new Error("Client with this username already exists");
  }

  password = generateRandomPassword();
  const salt = await bcrypt.genSalt(10);
  clientData.password = await bcrypt.hash(password, salt);

  return createClient(clientData);
};
// Login client
export const loginClient = async (
  username: string,
  password: string
): Promise<{ token: string; client: IClient }> => {
  const client = await getClientByUsername(username); // Find by username
  if (!client) {
    throw new Error("Invalid username or password");
  }

  const isMatch = await bcrypt.compare(password, client.password);
  if (!isMatch) {
    throw new Error("Invalid username or password");
  }

  // Generate token
  const token = jwt.sign({ _id: client._id }, JWT_SECRET);

  return { token, client };
};
