import * as React from 'react';
import { Box } from '@mui/material';

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
    {value === index && <Box>{children}</Box>}
  </div>
);
