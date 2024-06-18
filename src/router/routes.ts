import { RouteRecordRaw } from 'vue-router';
import AccessControlUtils from '../utils/AccessControlUtils';
import { useLoading } from 'src/composables/shared/loading/loading';

const { showloading } = useLoading();

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter(to, from, next) {
      // next();
      const authUser = sessionStorage.getItem('user');
      if (authUser === null || String(authUser).includes('null')) {
        next('/Login');
      } else {
        next();
      }
    },
    children: [
      { path: '', component: () => import('pages/Home/Home.vue') },
      {
        path: 'patients',
        component: () => import('pages/Patient/Patient.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Pacientes')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'patientpanel',
        component: () => import('pages/Patient/Panel/PatientPanel.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Pacientes')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'group/panel',
        component: () => import('pages/Groups/GroupPanel.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Grupos')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'group/search',
        component: () => import('pages/Groups/SearchAddGroup.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Grupos')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'stock',
        component: () => import('pages/Stock/Stock.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Stock')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'stock/entrance',
        component: () => import('pages/Stock/Entrance/EntrancePanel.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Stock')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'stock/drugFile',
        component: () => import('pages/Stock/DrugFile/DrugFile.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Stock')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'stock/inventory',
        component: () => import('pages/Stock/Inventory/InventoryPanel.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Stock')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'stock/stockDistributor',
        component: () =>
          import('pages/Stock/stockDistributor/StockDistributorPanel.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Stock')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },

      {
        path: 'stock/stockConfirmation',
        component: () =>
          import(
            'pages/Stock/stockConfirmation/StockConfirmDistributionPanel.vue'
          ),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Stock')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },

      {
        path: 'dashboard',
        component: () => import('pages/Dashboard/Dashboard.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Dashboard')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'reports',
        component: () => import('pages/Reports/Reports.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Relatorios')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'settings',
        component: () => import('pages/Settings/Settings.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Administração')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'migration',
        component: () => import('pages/Migration/Migration.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Migração')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'loadfiledc',
        component: () => import('pages/DCProvedor/loadFile.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('DCProvedor')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'home',
        component: () => import('pages/Home/Home.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('Tela Inicial')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
      {
        path: 'add-clinic',
        component: () => import('components/Settings/Clinic/AddClinic.vue'),
        beforeEnter(to, from, next) {
          if (!AccessControlUtils.menusVisible('add-clinic')) {
            next('/:catchAll(.*)*');
          } else {
            next();
          }
        },
      },
    ],
  },
  {
    path: '/Login',
    name: 'Login',
    component: () => import('pages/Login/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/Logout',
    component: () => import('pages/Logout/Logout.vue'),
    meta: { requiresAuth: false },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
