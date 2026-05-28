import { registerRootComponent } from 'expo';
import App from './App';

// Esto obliga a Metro a renderizar tu App.js clásica ignorando por completo Expo Router
registerRootComponent(App);