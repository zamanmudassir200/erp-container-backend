import { Client, IClient, IClientInput } from "../models/clientModel";

// Find client by email
export const getClientByEmail = async (
  email: string
): Promise<IClient | null> => {
  return Client.findOne({ email });
};
export const createClient = async (
  clientData: IClientInput
): Promise<IClient> => {
  const client = new Client(clientData);
  return client.save();
};

// Find client by username
export const getClientByUsername = async (
  username: string
): Promise<IClient | null> => {
  return Client.findOne({ username });
};

// Save client reset token
export const saveResetToken = async (
  clientId: string,
  resetToken: string,
  tokenExpiration: number
) => {
  return Client.findByIdAndUpdate(
    clientId,
    { resetPasswordToken: resetToken, resetPasswordExpires: tokenExpiration },
    { new: true }
  );
};

// Update password
export const updateClientPassword = async (
  clientId: string,
  newPassword: string
) => {
  return Client.findByIdAndUpdate(
    clientId,
    {
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
    { new: true }
  );
};

// Verify reset token
export const verifyResetToken = async (token: string) => {
  const client = await Client.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  return client;
};

export const findClientByEmail = async (email: string) => {
  return Client.findOne({ email });
};
