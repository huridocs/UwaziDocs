import React from 'react';

interface PillProps {
  children: string | React.ReactNode;
  color: 'primary' | 'gray' | 'yellow' | 'green';
  className?: string;
}

const Pill = ({ children, color = 'gray', className }: PillProps) => {
  let pillColors = '';

  switch (color) {
    case 'gray':
      pillColors = 'bg-gray-100';
      break;

    case 'yellow':
      pillColors = 'bg-yellow-100 text-yellow-800';
      break;

    case 'green':
      pillColors = 'bg-green-100 text-green-800';
      break;

    default:
      pillColors = 'bg-primary-100 text-primary-800';
      break;
  }
  return (
    <span
      className={`${className} px-2.5 py-1 rounded-md text-xs ${pillColors}`}
      data-testid="pill-comp"
    >
      {children}
    </span>
  );
};

export { Pill };
