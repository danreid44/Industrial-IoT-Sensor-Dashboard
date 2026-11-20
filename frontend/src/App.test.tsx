import { renderToStaticMarkup } from 'react-dom/server';
import App from './App';

const markup = renderToStaticMarkup(<App />);

if (markup === '') {
  throw new Error('App did not render any markup.');
}
