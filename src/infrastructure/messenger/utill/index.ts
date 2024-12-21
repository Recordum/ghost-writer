import { HttpRestMethod } from './types';
import * as CryptoJS from 'crypto-js';

export function getHeaders(
  method: HttpRestMethod,
  endpoint: string,
  accessKey: string,
  secretKey: string,
) {
  const unixTimeStamp = getUnixTimeStamp();
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'x-ncp-apigw-timestamp': unixTimeStamp,
    'x-ncp-iam-access-key': accessKey,
    'x-ncp-apigw-signature-v2': getSignature(
      method,
      endpoint,
      unixTimeStamp,
      secretKey,
      accessKey,
    ),
  };
}

function getUnixTimeStamp() {
  return Date.now().toString();
}

function getSignature(
  method: HttpRestMethod,
  url: string,
  unixTimeStamp: string,
  secretKey: string,
  accessKey: string,
) {
  const space = ' '; // one space
  const newLine = '\n'; // new line
  const timestamp = unixTimeStamp;

  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
  hmac.update(method);
  hmac.update(space);
  hmac.update(url);
  hmac.update(newLine);
  hmac.update(timestamp);
  hmac.update(newLine);
  hmac.update(accessKey);

  const hash = hmac.finalize();
  return hash.toString(CryptoJS.enc.Base64);
}
