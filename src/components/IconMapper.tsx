import React from 'react';
import * as Icons from 'lucide-react';

export interface IIconMapperProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconMapper: React.FC<IIconMapperProps> = ({ name, className = '', size = 18 }) => {
  const IconComponent = (Icons as Record<string, React.ElementType>)[name] || Icons.Circle;
  return <IconComponent className={className} size={size} />;
};
