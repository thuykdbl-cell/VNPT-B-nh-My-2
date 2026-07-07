/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InternetPlan {
  id: string;
  name: string;
  speed: number; // in Mbps
  price: number; // in VND/month
  meshDevices: number;
  hasMyTV: boolean;
  tvType?: string;
  features: string[];
  isPopular?: boolean;
}

export interface Registration {
  id: string;
  name: string;
  phone: string;
  address: string;
  planId: string;
  extraMesh: number;
  extraCamera: boolean;
  preferredDate: string;
  notes: string;
  status: 'pending' | 'surveyed' | 'installed' | 'cancelled';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}
