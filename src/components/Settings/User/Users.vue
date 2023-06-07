<template>
  <div>
    <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
      Utilizadores
    </div>
    <div class="">
      <q-table :rows="users" :columns="columns" :filter="filter">
        <template v-slot:top-right>
          <q-input
            outlined
            dense
            debounce="300"
            v-model="filter"
            placeholder="Procurar"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:no-data="{ icon, filter }">
          <div
            class="full-width row flex-center text-primary q-gutter-sm text-body2"
          >
            <span> Sem resultados para visualizar </span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="fullName" :props="props">
              {{ props.row.fullName }}
            </q-td>
            <q-td key="username" :props="props">
              {{ props.row.username }}
            </q-td>
            <q-td key="active" :props="props">
              {{ !props.row.accountLocked ? 'Sim' : 'Nao' }}
            </q-td>
            <q-td key="options" :props="props">
              <div class="col">
                <q-btn
                  flat
                  round
                  color="amber-8"
                  icon="edit"
                  @click="editUser(props.row)"
                  v-if="props.row.accountLocked === false"
                >
                  <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="visualizeUser(props.row)"
                >
                  <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  :color="getColorActive(props.row)"
                  :icon="getIconActive(props.row)"
                  @click.stop="promptToConfirm(props.row)"
                >
                  <q-tooltip :class="getTooltipClass(props.row)">{{
                    !props.row.accountLocked ? 'Inactivar' : 'Activar'
                  }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div class="absolute-bottomg">
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          size="xl"
          fab
          icon="add"
          @click="addUser"
          no-cap
          color="primary"
        />
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showUserRegistrationScreen">
      <addUserComp @close="showUserRegistrationScreen = false" />
    </q-dialog>
  </div>
</template>
<script setup>
/*imports*/
import { useQuasar } from 'quasar';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { ref, inject, onMounted, computed, reactive, provide } from 'vue';
import UserLogin from '../../../stores/models/userLogin/User';
import Role from '../../../stores/models/userLogin/Role';
import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';
import Clinic from '../../../stores/models/clinic/Clinic';
import ClinicSectorType from '../../../stores/models/clinicSectorType/ClinicSectorType';
import userService from 'src/services/api/user/userService.ts';
import sysConfigsService from 'src/services/api/systemConfigs/systemConfigsService.ts';

/*Components import*/
import addUserComp from 'src/components/Settings/User/AddUser.vue';

/*Variables*/
const { alertWarningAction } = useSwal();
const columns = [
  {
    name: 'fullName',
    required: true,
    label: 'Nome Completo',
    align: 'left',
    field: (row) => row.fullName,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'username',
    required: true,
    label: 'Nome do Utilizador',
    align: 'left',
    field: (row) => row.username,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'active',
    required: true,
    label: 'Activo',
    align: 'left',
    field: (row) => row.active,
    format: (val) => `${val}`,
    sortable: true,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];
const submitting = ref(false);
const showUserRegistrationScreen = ref(false);
const user = reactive(ref(userService.newInstanceEntity()));

/*Injects*/
const step = inject('step');
const filter = inject('filter');
const createMode = inject('createMode');
const editMode = inject('editMode');
const viewMode = inject('viewMode');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const currClinic = inject('currClinic');

/*Hooks*/
const users = computed(() => {
  return userService.getAllUsers();
});

const configs = computed(() => {
  return sysConfigsService.getActiveDataMigration();
});

/*Provides*/
provide('selectedUser', user);
provide('configs', configs);
provide('showUserRegistrationScreen', showUserRegistrationScreen);

/*Methods*/
// const getAllClinicsByProvinceCode = async (provinceCode) => {
//       await Clinic.api()
//         .get('/clinic/province/' + provinceCode)
//         .then((resp) => {
//           this.hideLoading();
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     },
const getIconActive = (user) => {
  if (user.accountLocked) {
    return 'play_circle';
  } else if (!user.accountLocked) {
    return 'stop_circle';
  }
};
const getColorActive = (user) => {
  if (user.accountLocked) {
    return 'green';
  } else if (!user.accountLocked) {
    return 'red';
  }
};
const getTooltipClass = (user) => {
  if (!user.accountLocked) {
    return 'bg-green-5';
  } else if (user.accountLocked) {
    return 'bg-red-5';
  }
};
const editUser = (userParam) => {
  user.value = userParam;
  isCreateStep.value = false;
  editMode.value = true;
  viewMode.value = false;
  showUserRegistrationScreen.value = true;
};
const addUser = () => {
  user.value = reactive(ref(userService.newInstanceEntity()));
  isCreateStep.value = true;
  editMode.value = false;
  viewMode.value = false;
  showUserRegistrationScreen.value = true;
};
const visualizeUser = (userParam) => {
  user.value = userParam;
  viewMode.value = true;
  editMode.value = false;
  showUserRegistrationScreen.value = true;
  conole.log(user.value);
};
const promptToConfirm = (user) => {
  const question = user.active
    ? 'Deseja Inactivar o Utilizador?'
    : 'Deseja Activar o Utilizador?';

  alertWarningAction(question).then((response) => {
    if (response) {
      if (user.active) {
        user.active = false;
      } else {
        user.active = true;
      }

      // if (this.mobile) {
      //         et userLocalBase = JSON.parse(JSON.stringify(user));
      // userLocalBase = this.encrypt(userLocalBase);
      // UserLogin.localDbAddOrUpdate(userLocalBase).then((resp) => {
      //   this.submitting = false;
      //   UserLogin.insert({
      //     data: userLocalBase,
      //   });
      //   this.displayAlert('info', msg);
      // });
      //       } else {
      userService
        .patch(user.id, user)
        .then((resp) => {
          submitting.value = false;
          showUserRegistrationScreen.value = false;
        })
        .catch((error) => {
          submitting.value = false;
          showUserRegistrationScreen.value = false;
        });
      // }
    }
  });
};
// getRolesToVuex() {
//   Role.localDbGetAll().then((roles) => {
//     Role.insert({ data: roles });
//   });
// },
// getSecUserToVuex() {
//   UserLogin.localDbGetAll().then((users) => {
//     UserLogin.insert({ data: users });
//   });
// },
// getSystemConfigsToVue() {
//   SystemConfigs.localDbGetAll().then((systemConfigs) => {
//     SystemConfigs.insert({ data: systemConfigs });
//   });
// },
// getClinicSectorTypeToVue() {
//   ClinicSectorType.localDbGetAll().then((clinicSectorTypes) => {
//     ClinicSectorType.insert({ data: clinicSectorTypes });
//   });
// },

// computed: {
//   users() {
//     return UserLogin.query()
//       .with('clinic.province')
//       .with('clinic.district.province')
//       .with('clinic.facilityType')
//       .with('clinicSectors.clinic.province')
//       .with('clinicSectors.clinic.district.province')
//       .with('clinicSectors.clinic.facilityType')
//       .with('clinicSectors.clinicSectorType')
//       .get();
//   },
//   configs() {
//     return SystemConfigs.query().where('key', 'INSTALATION_TYPE').first();
//   },
// },

// mounted() {
//   this.showloading();
//   if (this.website) {
//     // UserLogin.apiGetAll(0, 100);
//     // Role.apiGetAll().then((item) => {
//     //   this.hideLoading();
//     // });
//     if (this.configs.value === 'PROVINCIAL') {
//       this.getAllClinicsByProvinceCode(this.configs.description);
//     }
//   } else {
//     this.getRolesToVuex();
//     this.getSecUserToVuex();
//     this.getSystemConfigsToVue();
//     this.getClinicSectorTypeToVue();
//   }
//   // this.hideLoading()
// }
</script>
