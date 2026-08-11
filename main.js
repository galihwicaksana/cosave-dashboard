import './src/styles/main.css';
import initialData from './src/js/initialData.js';
import './src/js/supabaseClient.js';
import './src/js/app.js';

if (typeof window !== 'undefined') {
  window.initialData = initialData;
}
