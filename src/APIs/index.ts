import { Application } from 'express';
import { API_ROOT } from '../constant/application';

import General from './router';
import authRoutes from './user/authentication';
import userManagementRoutes from './user/management';
import container_router from '../APIs/container/routes';
import employeRouter from '../APIs/employeedata/router/router1';
import clientRoutes from '../APIs/client/index';
import adminRoutes from '../APIs/Admin/routes/Admin.routes';

const App = (app: Application) => {
  app.use(`${API_ROOT}`, General);
  app.use(`${API_ROOT}`, authRoutes);
  app.use(`${API_ROOT}/user`, userManagementRoutes);
  app.use(`${API_ROOT}/employee`, employeRouter);
  app.use(`${API_ROOT}/container`, container_router);
  app.use(`${API_ROOT}/client`, clientRoutes);
  app.use(`${API_ROOT}/admin`, adminRoutes);
};

export default App;
