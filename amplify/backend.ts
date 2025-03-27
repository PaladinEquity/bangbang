import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource';
import { payment } from './function/payment/resource';

defineBackend({
  auth,
  data,
  storage,
  payment
});
