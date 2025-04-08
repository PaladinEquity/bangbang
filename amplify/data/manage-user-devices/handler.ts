import type { Schema } from "../resource";
import { env } from "$amplify/env/manage-user-devices";
import {
  AdminForgetDeviceCommand,
  AdminGetDeviceCommand,
  AdminListDevicesCommand,
  AdminUpdateDeviceStatusCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

type Handler = Schema["manageUserDevices"]["functionHandler"];
const client = new CognitoIdentityProviderClient();

export const handler: Handler = async (event) => {
  const { operation, ...params } = event.arguments;

  switch (operation) {
    case "listDevices":
      return await listDevices(params);
    case "getDevice":
      return await getDevice(params);
    case "forgetDevice":
      return await forgetDevice(params);
    case "updateDeviceStatus":
      return await updateDeviceStatus(params);
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
};

async function listDevices({ username, limit = 60, paginationToken }: any) {
  const command = new AdminListDevicesCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    Username: username,
    Limit: limit,
    PaginationToken: paginationToken,
  });

  const response = await client.send(command);
  
  return {
    devices: response.Devices?.map(device => ({
      deviceKey: device.DeviceKey || '',
      deviceName: device.DeviceAttributes?.find(attr => attr.Name === 'device_name')?.Value || '',
      deviceStatus: '',
      lastModifiedDate: device.DeviceLastModifiedDate?.toISOString() || '',
      lastAuthenticatedDate: device.DeviceLastAuthenticatedDate?.toISOString() || '',
      attributes: device.DeviceAttributes?.reduce((acc: Record<string, string>, attr) => {
        if (attr.Name && attr.Value) {
          acc[attr.Name] = attr.Value;
        }
        return acc;
      }, {}) || {}
    })) || [],
    paginationToken: response.PaginationToken
  };
}

async function getDevice({ username, deviceKey }: any) {
  const command = new AdminGetDeviceCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    Username: username,
    DeviceKey: deviceKey,
  });

  const response = await client.send(command);
  const device = response.Device;
  
  return {
    deviceKey: device?.DeviceKey || '',
    deviceName: device?.DeviceAttributes?.find(attr => attr.Name === 'device_name')?.Value || '',
    deviceStatus: '',
    lastModifiedDate: device?.DeviceLastModifiedDate?.toISOString() || '',
    lastAuthenticatedDate: device?.DeviceLastAuthenticatedDate?.toISOString() || '',
    attributes: device?.DeviceAttributes?.reduce((acc: Record<string, string>, attr) => {
      if (attr.Name && attr.Value) {
        acc[attr.Name] = attr.Value;
      }
      return acc;
    }, {}) || {}
  };
}

async function forgetDevice({ username, deviceKey }: any) {
  const command = new AdminForgetDeviceCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    Username: username,
    DeviceKey: deviceKey,
  });

  await client.send(command);
  
  return { success: true, username, deviceKey };
}

async function updateDeviceStatus({ username, deviceKey, deviceRememberedStatus }: any) {
  const command = new AdminUpdateDeviceStatusCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    Username: username,
    DeviceKey: deviceKey,
    DeviceRememberedStatus: deviceRememberedStatus,
  });

  await client.send(command);
  
  return { success: true, username, deviceKey };
}