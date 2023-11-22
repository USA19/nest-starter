export class ResponsePayload {
  status: number;
  error?: string;
  message: string;
  name?: string;
}

export class ResponsePayloadResponse {
  response?: ResponsePayload;
}
