import * as React from 'react';

interface IProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const CustomTabPanel: React.FC<IProps> = ({ children, index, value, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index.toString()}`}
    aria-labelledby={`tab-${index.toString()}`}
    {...other}
  >
    {value === index && <div>{children}</div>}
  </div>
);
