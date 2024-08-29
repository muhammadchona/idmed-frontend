<template>
  <div>
    <div class="q-mb-md text-weight-bold text-subtitle1">
      <q-bar style="background-color: #9e9e9e2e">
        <div class="cursor-pointer non-selectable">Utilizadores</div>
      </q-bar>
      <q-separator class="q-my-md max-width" color="primary" ></q-separator>
    </div>
    <div class="">
      <q-table :loading="loading" :rows="users" :columns="columns" :filter="filter">
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Procurar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <div class="q-pa-md q-gutter-sm">
            <q-btn
              v-if="!website"
              color="primary"
              label="Adicionar Novo"
              no-caps
              outline
              rounded
              @click="addUser()"
            />
          </div>
        </template>
        <template v-slot:no-data="{ icon, filter }">
          <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
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
              {{ !props.row.accountLocked ? "Sim" : "Nao" }}
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
                    !props.row.accountLocked ? "Inactivar" : "Activar"
                  }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div class="absolute-bottomg">
      <q-page-sticky v-if="website" position="bottom-right" :offset="[18, 18]">
        <q-btn size="xl" fab icon="add" @click="addUser" no-cap color="primary" />
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showUserRegistrationScreen">
      <addUserComp @close="showUserRegistrationScreen = false" />
    </q-dialog>
  </div>
</template>
<script setup>
/*imports*/
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { ref, inject, computed, provide } from 'vue';
import userService from 'src/services/api/user/userService.ts';
import sysConfigsService from 'src/services/api/systemConfigs/systemConfigsService.ts';
import SecUser from 'src/stores/models/userLogin/User';
import addUserComp from 'src/components/Settings/User/AddUser.vue';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import roleService from 'src/services/api/role/roleService';

/*Variables*/
const { closeLoading } = useLoading();
const { alertWarningAction, alertSucess, alertError } = useSwal();
const { website } = useSystemUtils();
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
const user = ref(userService.newInstanceEntity());
const loading = ref(true);

/*Injects*/
const filter = inject('filter');
const editMode = inject('editMode');
const viewMode = inject('viewMode');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');

/*Hooks*/
const users = computed(() => {
  const users = ref(null);
  users.value = userService.getAllUsers();
  if (users.value && users.value.length >= 0) stopLoading();
  return users.value;
});

const stopLoading = () => {
  loading.value = false;
};

const configs = computed(() => {
  return sysConfigsService.getInstallationType();
});

/*Methods*/

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
  if(user.value.authorities.length === 0){
     userParam.roles.forEach((role) => {
       user.value.authorities.push(roleService.getByAuthority(role))
    })
  }
  isCreateStep.value = false;
  editMode.value = true;
  isEditStep.value = true;
  viewMode.value = false;
  showUserRegistrationScreen.value = true;
};
const addUser = () => {
  user.value = new SecUser();
  isCreateStep.value = true;
  isEditStep.value = false;
  editMode.value = false;
  viewMode.value = false;
  showUserRegistrationScreen.value = true;
};
const visualizeUser = (userParam) => {
  user.value = userParam;
  if(user.value.authorities.length === 0){
    userParam.roles.forEach((role) => {
      user.value.authorities.push(roleService.getByAuthority(role))
    })
  }
  viewMode.value = true;
  editMode.value = false;
  isEditStep.value = false;
  showUserRegistrationScreen.value = true;
};
const promptToConfirm = (user) => {
  const question = user.accountLocked
    ? 'Deseja Activar o Utilizador?'
    : 'Deseja Inactivar o Utilizador?';

  alertWarningAction(question).then((response) => {
    if (response) {
      if (user.accountLocked) {
        user.accountLocked = false; //Conta nao trancada
        user.enabled = true; // Conta Activa
      } else {
        user.accountLocked = true;
        user.enabled = false;
      }
      userService
        .patch(user.id, user)
        .then(() => {
          submitting.value = false;
          alertSucess('Utilizador actualizado com sucesso.');
          closeLoading();
        })
        .catch(() => {
          alertError('Aconteceu um erro inesperado ao actualizar o Utilizador.');
          closeLoading();
          submitting.value = false;
        });
    }
  });
};
/*Provides*/
provide('selectedUser', user);
provide('configs', configs);
provide('showUserRegistrationScreen', showUserRegistrationScreen);
</script>
