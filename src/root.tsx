import ReactDOM from 'react-dom/client';
import { Initializer } from './Initializer';

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(<Initializer />);
}
