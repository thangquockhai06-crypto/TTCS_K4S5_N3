import React from 'react';
import { ICustomer } from '../types';

interface ICustomerCardProps {
  customer: ICustomer;
}

export const CustomerCard: React.FC<ICustomerCardProps> = ({ customer }) => {
  return (
    <div className="customer-card">
      <h3 className="customer-card__name">{customer.name}</h3>
      <p className="customer-card__company">Công ty: {customer.company}</p>
      <p className="customer-card__info">Mã sở hữu: {customer.ownerId}</p>
      <div className="customer-card__actions">
        <button className="btn btn--primary">Xem chi tiết</button>
      </div>
    </div>
  );
};
