<template>
  <q-card style="width: 900px; max-width: 90vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="q-pa-md">
        <div class="row items-center">
          <q-icon name="manage_accounts" size="sm" />
          <span class="q-pl-sm text-subtitle2">Cadastrar Perfil</span>
        </div>
      </div>
      <q-separator color="grey-13" size="1px" />
    </q-card-section>
    <form @submit.prevent="validateRole">
      <q-scroll-area style="height: 600px">
        <q-card-section class="q-px-md">
          <div class="row q-mt-md">
            <q-input
              ref="nomeRef"
              square
              v-model="role.name"
              :rules="[(val) => nameRules(val)]"
              lazy-rules
              :disable="onlyView"
              class="col fild-radius"
              label="Nome"
              outlined
              dense
            />
          </div>
          <div class="row q-mt-md">
            <q-input
              ref="descriptionRef"
              square
              v-model="role.description"
              :rules="[(val) => descriptionRules(val)]"
              lazy-rules
              :disable="onlyView"
              class="col fild-radius"
              label="Descrição"
              outlined
              dense
            />
          </div>
          <div class="q-pa-md">
            <q-table
              title="Funcionalidades"
              :rows="menus"
              :columns="columns"
              row-key="code"
              selection="multiple"
              v-model:selected="role.menus"
              class="my-sticky-header-table"
              v-if="!onlyView"
              rows-per-page-options="8"
              dense
            >
            </q-table>
            <q-table
              class="col"
              title="Funcionalidades"
              :rows="role.menus"
              :columns="columns1"
              row-key="code"
              v-if="onlyView"
              dense
            />
          </div>
        </q-card-section>
        <q-scroll-observer @scroll="scrollHandler" />
      </q-scroll-area>
      <q-card-actions align="right" class="q-mb-md q-mr-sm">
        <q-btn label="Cancelar" color="red" @click="$emit('close')" />
        <q-btn
          type="submit"
          :loading="submitting"
          label="GRAVAR"
          color="primary"
          v-if="!onlyView"
        />
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
/*Imports*/
import { ref, inject, onMounted, computed } from 'vue';
import roleService from 'src/services/api/role/roleService.ts';
import menuService from 'src/services/api/menu/menuService.ts';
import { useSwal } from 'src/composables/shared/dialog/dialog';

/*Variables*/
const { alertSucess, alertError } = useSwal();
const columns = [
  {
    name: 'descrição',
    required: true,
    label: 'Seleccionar Todas',
    align: 'left',
    field: (row) => row.description,
    format: (val) => `${val}`,
    sortable: true,
  },
];

const columns1 = [
  {
    name: 'descrição',
    required: true,
    label: 'Descrição',
    align: 'left',
    field: (row) => row.description,
    format: (val) => `${val}`,
    sortable: true,
  },
];
const databaseCodes = ref([]);
const databaseDescriptions = ref([]);
const submitting = ref(false);
const nomeRef = ref(null);
const descriptionRef = ref(null);

/*Injects*/
const viewMode = inject('viewMode');
const isCreateStep = inject('isCreateStep');
const showRoleRegistrationScreen = inject('showRoleRegistrationScreen');
const role = inject('selectedRole');
const selectedRole = inject('selectedRole');
const isEditStep = inject('isEditStep');

/*Hooks*/
const onlyView = computed(() => {
  return viewMode.value;
});

const userRoles = computed(() => {
  return roleService.getAllWithMenus();
});
const menus = computed(() => {
  return menuService.getAll().filter((arrayItem) => arrayItem.code !== '08');
});

onMounted(() => {
  extractDatabaseCodes();
});

/*Methods*/
const extractDatabaseCodes = () => {
  userRoles.value.forEach((element) => {
    databaseCodes.value.push(element.name);
    databaseDescriptions.value.push(element.description);
  });
};

const validateRole = () => {
  nomeRef.value.validate();
  descriptionRef.value.validate();
  if (!nomeRef.value.hasError && !descriptionRef.value.hasError) {
    if (role.value.menus.length <= 0) {
      alertError('Seleccione pelo menos uma funcionalidade!');
    } else {
      submitUser();
    }
  }
};

const submitUser = () => {
  submitting.value = true;
  role.value.active = true;
  if (role.value.authority === null || role.value.authority === undefined)
    role.value.authority = 'ROLE_' + role.value.name;
  // if (website) {
  if (isCreateStep.value) {
    roleService
      .post(role.value)
      .then((resp) => {
        alertSucess('O Registo foi efectuado com sucesso');
        submitting.value = false;
        showRoleRegistrationScreen.value = false;
      })
      .catch((error) => {
        submitting.value = false;
        showRoleRegistrationScreen.value = false;
      });
  } else {
    roleService
      .patch(role.value.id, role.value)
      .then((resp) => {
        submitting.value = false;
        showRoleRegistrationScreen.value = false;
      })
      .catch((error) => {
        submitting.value = false;
        showRoleRegistrationScreen.value = false;
      });
  }
};

const nameRules = (val) => {
  if (val === '') {
    return 'O nome é obrigatorio';
  } else if (val.length < 3) {
    return 'O nome indicado deve ter no mínimo 3 caracteres';
  } else if (
    (databaseCodes.value.includes(val) &&
      selectedRole.value.id === role.value.id &&
      !isEditStep.value) ||
    (databaseCodes.value.includes(val) &&
      userRoles.value.filter((x) => x.name === val)[0].id !== role.value.id &&
      isEditStep.value)
  ) {
    return !databaseCodes.value.includes(val) || 'o nome indicado já existe';
  }
};
const descriptionRules = (val) => {
  if (val.length < 3) {
    console.log(val);
    console.log(databaseDescriptions.value);
    return 'A descrição indicada deve ter no mínimo 3 caracteres';
  } else if (
    (databaseDescriptions.value.includes(val) &&
      selectedRole.value.id === role.value.id &&
      !isEditStep.value) ||
    (databaseDescriptions.value.includes(val) &&
      userRoles.value.filter((x) => x.description === val)[0].id !==
        role.value.id &&
      isEditStep.value)
  ) {
    return (
      !databaseDescriptions.value.includes(val) ||
      'A descrição indicada já existe'
    );
  }
};
</script>

<style>
.fild-radius {
  border-radius: 5px;
}
</style>
