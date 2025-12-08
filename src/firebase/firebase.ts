import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBx_t-MMpGplmhoXb15yMgS4WZB0b4AUUA',
  authDomain: 'weather-app-58954.firebaseapp.com',
  projectId: 'weather-app-58954',
  storageBucket: 'weather-app-58954.firebasestorage.app',
  messagingSenderId: '774741827372',
  appId: '1:774741827372:web:46d1e10166181c9c7e5689',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
