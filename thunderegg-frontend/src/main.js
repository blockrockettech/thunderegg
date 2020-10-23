import {createApp} from 'vue';
import App from './App.vue';
import store from './store'

import Oruga from '@oruga-ui/oruga-next'
import '@oruga-ui/oruga-next/dist/oruga.css'

createApp(App)
  .use(store)
  .use(Oruga)
  .mount('#app');

