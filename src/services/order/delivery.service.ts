import { apiClient } from '@/lib/api-client'
import type {
  CommerceApiSuccess,
  DigitalDeliveryToken,
  DownloadRedeemResult,
} from '@/types/order'

export const deliveryService = {
  getMyDownloads: () =>
    apiClient.get<CommerceApiSuccess<DigitalDeliveryToken[]>>('/api/delivery/my-downloads'),

  getDownloadForOrderItem: (orderItemId: string) =>
    apiClient.get<CommerceApiSuccess<DownloadRedeemResult>>(
      `/api/delivery/order-items/${orderItemId}`,
    ),
}
