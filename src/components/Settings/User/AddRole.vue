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
              :rules="[(val) => codeRules(val)]"
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
              :rules="[
                (val) =>
                  val.length >= 3 ||
                  'A descrição indicado deve ter no mínimo 3 caracteres',
              ]"
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
            >
            </q-table>
            <q-table
              class="col"
              title="Funcionalidades"
              :rows="role.menus"
              :columns="columns1"
              row-key="code"
              v-if="onlyView"
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
          label="GUARDAR"
          color="primary"
          v-if="!onlyView"
        />
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
/*Imports*/
import { ref, inject, provide, onMounted, computed, reactive } from 'vue';
import roleService from 'src/services/api/role/roleService.ts';
import menuService from 'src/services/api/menu/menuService.ts';
import { useSwal } from 'src/composables/shared/dialog/dialog';

/*Components import*/
import nameInput from 'src/components/Shared/NameInput.vue';

/*Variables*/
const { alertError } = useSwal();
const step = ref(1);
const columns = [
  {
    name: 'descricao',
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
    name: 'descricao',
    required: true,
    label: 'Descricão',
    align: 'left',
    field: (row) => row.description,
    format: (val) => `${val}`,
    sortable: true,
  },
];
const databaseCodes = ref([]);
const submitting = ref(false);
const userRole = ref('');
const clinico = ref('');
const isPwd = ref(true);
const nomeRef = ref(null);
const descriptionRef = ref(null);

/*Injects*/
const createMode = inject('createMode');
const editMode = inject('editMode');
const viewMode = inject('viewMode');
const stepp = inject('step');
const his = inject('selectedHis');
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
  role.value.authority = 'ROLE_' + role.value.name;
  // if (website) {
  if (isCreateStep.value) {
    roleService
      .post(role.value)
      .then((resp) => {
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
  // } else {
  //  // role.id = uuidv4()
  //   role.syncStatus = 'R'
  //   const roleLocalBase = JSON.parse(JSON.stringify(role))
  //   console.log(role)
  //   console.log(roleLocalBase)
  //   Role.localDbAddOrUpdate(roleLocalBase).then(resp => {
  //     submitting = false
  //     Role.insert({
  //         data: roleLocalBase
  //     })
  //      displayAlert('info', role.id === null ? 'Perfil cadastrado com sucesso' : 'Perfil actualizado com sucesso.')
  //   })
  // }
};

const codeRules = (val) => {
  if (val === '') {
    return 'o Código é obrigatorio';
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
    return !databaseCodes.value.includes(val) || 'o Código indicado já existe';
  }
};
</script>

<style>
.fild-radius {
  border-radius: 5px;
}
</style>
