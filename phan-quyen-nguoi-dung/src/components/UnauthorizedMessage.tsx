import React from 'react';

interface IUnauthorizedMessageProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const UnauthorizedMessage: React.FC<IUnauthorizedMessageProps> = ({ message, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="alert alert--error">
      <span className="alert__text">{message}</span>
      <button className="alert__close" onClick={onClose}>X</button>
    </div>
  );
};
