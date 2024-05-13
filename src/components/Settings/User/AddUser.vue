<template>
  <q-card style="width: 1000px; max-width: 90vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="q-pa-md">
        <div class="row items-center">
          <q-icon name="people" size="sm" />
          <span v-if="isCreateStep" class="q-pl-sm text-subtitle2"
            >Cadastrar Utilizador</span
          >
          <span v-if="isEditStep" class="q-pl-sm text-subtitle2"
            >Editar Utilizador</span
          >
          <span v-if="onlyView" class="q-pl-sm text-subtitle2"
            >Dados do Utilizador</span
          >
        </div>
      </div>
      <q-separator color="grey-13" size="1px" />
    </q-card-section>
    <form>
      <q-scroll-area style="height: 600px">
        <q-stepper v-model="step" ref="stepper" animated>
          <q-step :name="1" title="Dados Iniciais">
            <q-card-section class="q-px-md">
              <div class="row q-mt-md">
                <q-input
                  outlined
                  dense
                  @input="(event) => $emit('update:name', event.target.value)"
                  ref="nomeRef"
                  square
                  v-model="user.fullName"
                  :rules="[(val) => codeRulesNomeCompleto(val)]"
                  lazy-rules
                  :disable="onlyView"
                  class="col fild-radius"
                  label="Nome Completo"
                />
              </div>
              <div class="row">
                <q-input
                  outlined
                  dense
                  ref="usernameRef"
                  square
                  v-model="user.username"
                  :rules="[(val) => userNameRules(val)]"
                  lazy-rules
                  :disable="onlyView"
                  class="col fild-radius"
                  label="Nome de Utilizador"
                />
              </div>
              <div class="row" v-if="!editMode">
                <q-input
                  v-model="user.password"
                  dense
                  rounded
                  outlined
                  square
                  class="col"
                  label="Senha"
                  :rules="[(val) => userPasswordRules(val)]"
                  ref="passwordRef"
                  :disable="onlyView"
                  :type="isPwd ? 'password' : 'text'"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                      color="primary"
                    />
                  </template>
                </q-input>
              </div>
              <div class="row q-gutter-md" v-if="editMode">
                <q-input
                  v-model="user.password"
                  dense
                  rounded
                  outlined
                  square
                  class="col"
                  label="Senha"
                  :rules="[(val) => userPasswordRules(val)]"
                  ref="passwordRef"
                  :disable="onlyView"
                  type="password"
                >
                  <template v-slot:append>
                    <q-icon
                      name="close"
                      @click="user.password = ''"
                      class="cursor-pointer"
                    />
                  </template>
                </q-input>
              </div>
              <div class="row q-mb-md">
                <q-input
                  outlined
                  maxlength="12"
                  v-model="user.contact"
                  dense
                  lazy-rules
                  ref="contactRef"
                  :disable="onlyView"
                  class="col fild-radius"
                  :rules="[(val) => userContactRules(val)]"
                  label="Contact"
                />
              </div>
              <div class="row q-mb-md">
                <q-input
                  dense
                  outlined
                  lazy-rules
                  ref="emailRef"
                  class="col fild-radius"
                  v-model="user.email"
                  :disable="onlyView"
                  type="email"
                  label="Email"
                />
              </div>
              <q-separator />
              <div class="row q-mb-md q-mt-sm float-right">
                <q-checkbox
                  dense
                  v-model="user.accountLocked"
                  keep-color
                  :label="
                    user.accountLocked
                      ? 'Utilizador Bloqueado'
                      : 'Utilizador Activo'
                  "
                  :color="user.accountLocked ? 'red' : 'teal'"
                />
              </div>
              <div class="row q-gutter-sm">
                <div class="q-mb-sm">
                  <q-table
                    style="max-width: 450px; max-height: 350px"
                    title="Perfis"
                    :rows="rolesForView"
                    :columns="columns"
                    row-key="authority"
                    v-if="onlyView"
                    class="my-sticky-header-table"
                    dense
                  />
                </div>
                <div class="q-mb-sm" v-if="isProvincial">
                  <q-table
                    style="max-width: 450px; max-height: 350px"
                    title="Farmacias"
                    :rows="selectedClinics"
                    :columns="columnsClinics"
                    row-key="code"
                    v-if="onlyView"
                    class="my-sticky-header-table"
                    dense
                  />
                </div>
                <div class="cpa-md">
                  <q-table
                    style="max-width: 450px; max-height: 350px"
                    title="Sectores Clinicos"
                    :rows="selectedClinics"
                    :columns="columnsClinicSectors"
                    row-key="code"
                    v-if="onlyView"
                    class="my-sticky-header-table"
                    dense
                  />
                </div>
              </div>
            </q-card-section>
          </q-step>
          <q-step :name="2" title="Perfis">
            <div class="q-mb-md">
              <q-table
                title="Perfis"
                :rows="userRoles"
                :columns="columns"
                row-key="authority"
                selection="multiple"
                v-model:selected="selectedRoles"
                class="my-sticky-header-table"
                rows-per-page-options="7"
                dense
              >
              </q-table>
            </div>
          </q-step>
          <q-step :name="3" title="Farmacias/Sectores Clinicos">
            <div class="q-mb-md" v-if="isProvincial">
              <q-table
                title="Farmacias"
                :rows="clinics"
                :columns="columnsClinics"
                row-key="code"
                selection="multiple"
                v-model:selected="selectedClinics"
                class="my-sticky-header-table"
                rows-per-page-options="7"
                dense
              >
              </q-table>
            </div>
            <div class="row" v-if="!isProvincial">
              <nameInput
                ref="clinic"
                square
                v-model="currClinic.clinicName"
                lazy-rules
                class="col fild-radius"
                :disable="!isProvincial"
                label="Farmacia do Utilizador"
              />
            </div>
            <div class="q-mb-md" v-if="!isProvincial">
              <q-table
                title="Sectores Clinicos"
                :rows="clinicSectors"
                :columns="columnsClinicSectors"
                row-key="code"
                selection="multiple"
                v-model:selected="selectedClinicSectors"
                class="my-sticky-header-table"
                rows-per-page-options="7"
                dense
              >
              </q-table>
            </div>
          </q-step>
        </q-stepper>
        <q-scroll-observer />
      </q-scroll-area>
      <q-card-actions align="right" class="q-mb-md">
        <q-stepper-navigation>
          <q-btn label="Cancelar" color="red" @click="$emit('close')" />
          <q-btn
            v-if="step > 1 && !onlyView"
            color="primary"
            @click="stepper.previous()"
            label="Voltar"
            class="q-ml-sm"
          />
          <q-btn
            @click="goToNextStep"
            v-if="!onlyView"
            color="primary"
            :label="step !== 3 ? 'Proximo' : 'Gravar'"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
/*imports*/
import { ref, inject, onMounted, computed } from 'vue';
import clinicService from 'src/services/api/clinicService/clinicService.ts';
import userService from 'src/services/api/user/userService.ts';
import roleService from 'src/services/api/role/roleService.ts';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService.ts';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { alertSucess, alertError } = useSwal();
const { closeLoading, showloading } = useLoading();

/*Components import*/
import nameInput from 'src/components/Shared/NameInput.vue';

/*Variables*/
const nomeRef = ref(null);
const usernameRef = ref(null);
const passwordRef = ref(null);
const contactRef = ref(null);
const emailRef = ref(null);

const validatestep1 = () => {
  nomeRef.value.validate();
  usernameRef.value.validate();
  passwordRef.value.validate();
  contactRef.value.validate();

  return (
    !nomeRef.value.hasError &&
    !usernameRef.value.hasError &&
    !passwordRef.value.hasError &&
    !contactRef.value.hasError
  );
};

const columns = ref([
  {
    name: 'descricao',
    required: true,
    label: 'Descrição',
    align: 'left',
    field: (row) => row.authority,
    format: (val) => `${val}`,
    sortable: true,
  },
]);

const columnsClinics = ref([
  {
    name: 'descricao',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.clinicName,
    format: (val) => `${val}`,
    sortable: true,
  },
]);

const columnsClinicSectors = ref([
  {
    name: 'descricao',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.clinicName,
    format: (val) => `${val}`,
    sortable: true,
  },
]);
const databaseCodes = ref([]);
const submitting = ref(false);
const step = ref(1);
const isPwd = ref(true);
const selectedRoles = ref([]);
const selectedClinics = ref([]);
const selectedClinicSectors = ref([]);
const isProvincial = ref(false);
const stepper = ref();

/*injects*/
const editMode = inject('editMode');
const viewMode = inject('viewMode');
const currClinic = inject('currClinic');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const user = inject('selectedUser');
const configs = inject('configs');
const showUserRegistrationScreen = inject('showUserRegistrationScreen');

/*Hooks*/
onMounted(() => {
  loadUserRelations();

  extractDatabaseCodes();
  if (configs.value.value === 'LOCAL') {
    isProvincial.value = false;
    user.value.clinics[0] = currClinic.value;
  } else {
    isProvincial.value = true;
    selectedClinics.value[0] = currClinic.value;
  }
});

const onlyView = computed(() => {
  return viewMode.value;
});

const rolesForView = computed(() => {
  const res = ref([]);

  if (onlyView.value && user.value.id !== null) {
    res.value = user.value.authorities;
  }

  return res.value;
});

const userRoles = computed(() => {
  return roleService.getActiveWithMenus();
});

const clinics = computed(() => {
  return clinicService.getAllClinics();
});
const users = computed(() => {
  return userService.getAllUsers();
});
const clinicSectors = computed(() => {
  const allClinicSectors = clinicService.getActivebyClinicId(
    currClinic.value.id
  );
  return onlyView.value ? user.value.clinicSectors : allClinicSectors;
});

/*Methods*/
const loadUserRelations = () => {
  if (user.value !== null && user.value !== undefined) {
    if (user.value.id !== null) {
      selectedRoles.value = user.value.authorities;
      selectedClinics.value = user.value.clinics;
      selectedClinicSectors.value = user.value.clinics;
    }
  }
};

const goToNextStep = () => {
  if (step.value === 1) {
    if (validatestep1()) stepper.value.next();
    // }
  } else if (step.value === 2) {
    if (selectedRoles.value.length <= 0) {
      alertError(
        'Por Favor, seleccione pelo menos um Perfil para o utilizador.'
      );
    } else {
      stepper.value.next();
    }
  } else if (step.value === 3) {
    if (selectedClinicSectors.value.length <= 0) {
      alertError(
        'Por Favor, seleccione pelo menos uma Farmácia para dar Acesso.'
      );
    } else {
      submitUser();
    }
  }
};
const submitUser = () => {
  showloading();
  submitting.value = true;
  selectedRoles.value = JSON.parse(JSON.stringify(selectedRoles.value));
  const roless = [];
  selectedRoles.value.forEach((role) => {
    roless.push(role.authority);
  });

  user.value.roles = roless;
  // user.value.clinics = selectedClinics.value;
  // user.value.clinics.push(currClinic.value);
  user.value.clinics = selectedClinicSectors.value;
  user.value.authorities = selectedRoles.value;

  if (user.value.contact === null || user.value.contact === undefined) {
    user.value.contact = '-';
  }

  if (isCreateStep.value) {
    userService
      .post(user.value)
      .then(() => {
        closeLoading();
        alertSucess('Utilizador registado com sucesso');
        submitting.value = false;
        rolesForView.value = user.value.authorities;
        showUserRegistrationScreen.value = false;
      })
      .catch((error) => {
        closeLoading();
        console.log(error);
        alertError('Aconteceu um erro inesperado ao registar o Utilizador.');
        submitting.value = false;
        showUserRegistrationScreen.value = false;
      });
  } else {
    console.log('User', user.value);
    userService
      .patch(user.value.id, user.value)
      .then(() => {
        closeLoading();
        alertSucess('Utilizador actualizado com sucesso.');
        submitting.value = false;
        rolesForView.value = user.value.authorities;
        console.log(rolesForView.value);
        showUserRegistrationScreen.value = false;
      })
      .catch((error) => {
        closeLoading();
        console.log(error);
        alertError('Aconteceu um erro inesperado ao actualizar o Utilizador.');
        submitting.value = false;
        showUserRegistrationScreen.value = false;
      });
  }
};

const extractDatabaseCodes = () => {
  users.value.forEach((element) => {
    databaseCodes.value.push(element.username);
  });
};
const codeRulesNomeCompleto = (val) => {
  if (val === '') {
    return 'O nome é obrigatorio';
  } else if (val.length < 3) {
    return 'O  nome  deve ter no mínimo 3 caracteres';
  }
};
const userNameRules = (val) => {
  if (val === '') {
    return 'o nome do utilizador é obrigatorio';
  } else if (val.length < 3) {
    return 'O  nome do utilizador indicado deve ter no mínimo 3 caracteres';
  } else if (
    (databaseCodes.value.includes(val) && !isEditStep.value) ||
    (databaseCodes.value.includes(val) &&
      users.value.filter((x) => x.username === val)[0].id !== user.value.id &&
      !isEditStep.value)
  ) {
    return (
      !databaseCodes.value.includes(val) ||
      'O  nome do utilizador indicado já existe'
    );
  }
};

const userPasswordRules = (val) => {
  if (val === '') {
    return 'A Senha é obrigatoria';
  } else if (val.length < 4) {
    return 'A senha deve ter um minimo de 4 caracteres';
  }
};

const userContactRules = (val) => {
  if (val.length < 9) return 'O contacto deve ter um minimo de 9 caracteres';
};
</script>

<style>
.fild-radius {
  border-radius: 5px;
}
</style>
<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */

  .q-table__top
    /* bg color is important for th; just specify one */
    background-color: #0ba58b

  thead tr th
    position: sticky
    z-index: 0
  thead tr
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 0px
</style>
