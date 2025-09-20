import React from "react";
import styles from "./OrdersDisplay.module.css";
import { IOrder } from "../../../models/Order";
import { useTranslation } from 'react-i18next';

interface OrdersDisplayProps {
  orders: IOrder[];
}

const OrdersDisplay: React.FC<OrdersDisplayProps> = ({ orders }) => {
  const { t } = useTranslation();

  if (!orders || orders.length === 0) {
    return (
      <div className={styles.ordersContainer}>
        <h3>{t('user.profile.recentOrders')}</h3>
        <p>{t('user.profile.noOrders')}</p>
      </div>
    );
  }

  return (
    <div className={styles.ordersContainer}>
      <h3>{t('user.profile.recentOrders')}</h3>
      <ul className={styles.orderList}>
        {orders.map((order) => (
          <li key={order._id} className={styles.orderItem}>
            <div className={styles.orderDetails}>
              <p><strong>{t('common.name')}:</strong> {order._id}</p>

              {order.products?.length > 0 && (
                <>
                  <p><strong>{t('company.orders.products')}:</strong></p>
                  <ul className={styles.orderProducts}>
                    {order.products.map((product, index) => (
                      <li key={product.product_id?._id || `product-${index}`}>
                        {t('common.name')}: {product.product_id?.name || t('common.notAvailable')},
                        {t('common.quantity')}: {product.quantity}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <p><strong>{t('company.orders.date')}:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
              <p><strong>{t('common.status')}:</strong> {order.status}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersDisplay;