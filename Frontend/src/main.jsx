// import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import { store } from './store/store';
import {Provider} from 'react-redux';
import './index.css'
import App from './App';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Provider store={store}>
    <App>
      </App>
      </Provider>
    </BrowserRouter>
    

  
)

