<template>
  <q-card style="width: 900px; max-width: 90vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="q-pa-md">
        <div class="row items-center">
          <q-icon name="people" size="sm" />
          <span class="q-pl-sm text-subtitle2">Cadastrar Utilizador</span>
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
                <nameInput
                  ref="nome"
                  square
                  v-model="user.fullName"
                  :rules="[
                    (val) => val.length >= 3 || 'O nome indicado é inválido',
                  ]"
                  lazy-rules
                  :disable="onlyView"
                  class="col fild-radius"
                  label="Nome Completo"
                />
              </div>
              <div class="row">
                <nameInput
                  ref="username"
                  square
                  v-model="user.username"
                  :rules="[(val) => codeRules(val)]"
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
                  :rules="[
                    (val) =>
                      val.length >= 4 ||
                      'A senha deve ter um minimo de 4 caracteres',
                  ]"
                  ref="password"
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
              <div class="row" v-if="editMode">
                <q-input
                  v-model="user.password"
                  dense
                  rounded
                  outlined
                  square
                  class="col"
                  label="Senha"
                  :rules="[
                    (val) =>
                      val.length >= 4 ||
                      'A senha deve ter um minimo de 4 caracteres',
                  ]"
                  ref="password"
                  :disable="onlyView"
                  type="password"
                >
                </q-input>
              </div>
              <div class="row q-mb-md">
                <PhoneField
                  v-model="user.contact"
                  dense
                  lazy-rules
                  ref="contact"
                  :disable="onlyView"
                  class="col fild-radius"
                  :rules="[
                    (val) =>
                      val.length >= 9 ||
                      'O contacto deve ter um minimo de 9 caracteres',
                  ]"
                  label="Contact"
                />
              </div>
              <div class="row q-mb-md">
                <q-input
                  dense
                  outlined
                  lazy-rules
                  class="col fild-radius"
                  v-model="user.email"
                  :disable="onlyView"
                  type="email"
                  label="Email"
                />
              </div>
              <div class="row">
                <div class="col-4 col-md-6 pa-md">
                  <q-table
                    style="max-width: 450px; max-height: 350px"
                    title="Perfis"
                    :rows="selectedRoles"
                    :columns="columns"
                    row-key="authority"
                    v-if="onlyView"
                    class="my-sticky-header-table"
                  />
                </div>
                <div class="col-4 col-md-6 pa-md">
                  <q-table
                    style="max-width: 450px; max-height: 350px"
                    title="Farmacias"
                    :rows="selectedClinics"
                    :columns="columnsClinics"
                    row-key="code"
                    v-if="onlyView"
                    class="my-sticky-header-table"
                  />
                </div>
                <div class="col-4 col-md-6 pa-md">
                  <q-table
                    style="max-width: 450px; max-height: 350px"
                    title="Sectores Clinicos"
                    :rows="clinicSectors"
                    :columns="columnsClinicSectors"
                    row-key="code"
                    v-if="onlyView"
                    class="my-sticky-header-table"
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
              >
              </q-table>
            </div>
          </q-step>
        </q-stepper>
        <q-scroll-observer @scroll="scrollHandler" />
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
import UserLogin from 'src/stores/models/userLogin/User';
import Role from 'src/stores/models/userLogin/Role';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { ref, inject, onMounted, computed, reactive, provide } from 'vue';
import Clinic from '../../../stores/models/clinic/Clinic';
import ClinicSector from '../../../stores/models/clinicSector/ClinicSector';
import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';
import clinicService from 'src/services/api/clinicService/clinicService.ts';
import userService from 'src/services/api/user/userService.ts';
import roleService from 'src/services/api/role/roleService.ts';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService.ts';
// import SecUserRole from 'src/stores/models/userLogin/SecUserRole'

/*Components import*/
import nameInput from 'src/components/Shared/NameInput.vue';
import PhoneField from 'src/components/Shared/Input/PhoneField.vue';

/*Variables*/
const { alertError } = useSwal();
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
    field: (row) => row.description,
    format: (val) => `${val}`,
    sortable: true,
  },
]);
const databaseCodes = ref([]);
const submitting = ref(false);
const userRole = ref('');
const clinico = ref('');
const step = ref(1);
const isPwd = ref(true);
const selectedRoles = ref([]);
const selectedClinics = ref([]);
const selectedClinicSectors = ref([]);
const isProvincial = ref(false);
const stepper = ref();

/*injects*/
const stepp = inject('step');
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
  if (user.value !== null && user.value !== undefined) {
    if (user.value.id !== null) {
      selectedRoles.value = user.value.authorities;
      selectedClinics.value = user.value.clinics;
      selectedClinicSectors.value = user.value.clinicSectors;
    }
  }
  extractDatabaseCodes();
  if (configs.value.value === 'LOCAL') {
    isProvincial.value = false;
    user.value.clinics[0] = currClinic.value;
    selectedClinics.value[0] = currClinic.value;
    console.log(user.value);
  } else {
    isProvincial.value = true;
  }
});

const onlyView = computed(() => {
  return viewMode.value;
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
  const allClinicSectors = clinicSectorService.getActivebyClinicId(
    currClinic.value.id
  );
  // const allClinicSectors = ClinicSector.query().with('clinic.province')
  //             .with('clinic.district.province')
  //             .with('clinic.facilityType')
  //             .with('clinicSectorType').has('code').where('active', true).get()
  return onlyView.value ? user.value.clinicSectors : allClinicSectors;
});

/*Methods*/
const goToNextStep = () => {
  if (step.value === 1) {
    // $refs.nome.$refs.ref.validate()
    // $refs.password.validate()
    //  $refs.username.$refs.ref.validate()
    //  $refs.contact.$refs.ref.validate()
    // if (!$refs.nome.$refs.ref.hasError &&
    //     !$refs.password.hasError && !$refs.username.$refs.ref.hasError &&
    //      !$refs.contact.$refs.ref.hasError) {
    console.log(userRoles.value);
    stepper.value.next();
    // }
  } else if (step.value === 2) {
    if (selectedRoles.value.length <= 0) {
      alertError(
        'erro',
        'Por Favor seleccione pelo menos um Menu para dar Acesso'
      );
    } else {
      stepper.value.next();
    }
  } else if (step.value === 3) {
    console.log(selectedClinicSectors.value);
    if (selectedClinicSectors.value.length <= 0) {
      alertError(
        'error',
        'Por Favor seleccione pelo menos uma Farmácia para dar Acesso'
      );
    } else {
      submitUser();
    }
  }
};
// const validateUser = () => {
//     $refs.role.validate()
//     $refs.nome.$refs.ref.validate()
//     $refs.password.validate()
//      $refs.username.$refs.ref.validate()
//      $refs.contact.$refs.ref.validate()
//     if (!$refs.nome.$refs.ref.hasError &&
//         !$refs.password.hasError && !$refs.username.$refs.ref.hasError &&
//         !$refs.role.hasError && !$refs.contact.ref.hasError) {
//         submitUser()
//     }
//     };
const submitUser = () => {
  submitting.value = true;
  selectedRoles.value = JSON.parse(JSON.stringify(selectedRoles.value));
  const roles = [];
  selectedRoles.value.forEach((role) => {
    roles.push(role.authority);
  });
  console.log(selectedClinics.value);
  console.log(selectedClinicSectors.value);
  selectedClinics.value = JSON.parse(JSON.stringify(selectedClinics.value));
  selectedClinicSectors.value = JSON.parse(
    JSON.stringify(selectedClinicSectors.value)
  );
  user.value.roles = roles;
  user.value.clinics = selectedClinics.value;
  user.value.clinicSectors = selectedClinicSectors.value;
  user.value.accountLocked = false;
  user.value.authorities = selectedRoles.value;
  user.value.clinics[0] = user.value.clinicSectors[0].clinic;
  /* selectedClinicSectors.forEach(item => {
          item.clinic = selectedClinics[0]
        }) */
  // if (website) {
  if (isCreateStep.value) {
    console.log(user.value);
    userService
      .post(user.value)
      .then((resp) => {
        submitting.value = false;
        showUserRegistrationScreen.value = false;
      })
      .catch((error) => {
        submitting.value = false;
        showUserRegistrationScreen.value = false;
      });
  } else {
    userService
      .patch(user.value.id, user.value)
      .then((resp) => {
        submitting.value = false;
        showUserRegistrationScreen.value = false;
      })
      .catch((error) => {
        submitting.value = false;
        showUserRegistrationScreen.value = false;
      });
    // HealthInformationSystem.apiUpdate(his).then(resp => {
    //     // console.log(resp.response.data)
    //   displayAlert('info', !isEditStep ? 'Sistema De Informação de Saúde gravado com sucesso.' : 'Sistema De Informação de Saúde actualizado com sucesso.')
    //   submitting = false
    //   HealthInformationSystem.apiFetchById(resp.response.data.id)
    // }).catch(error => {
    //     displayAlert('error', error)
    //     submitting = false
    // })
  }
  // UserLogin.apiSave(user)
  //   .then((resp) => {
  //     const userResp = resp.response.data;
  //     userResp.authorities = selectedRoles;
  //     userResp.clinics = selectedClinics;
  //     userResp.clinicSectors = selectedClinicSectors;
  //     UserLogin.insert({
  //       data: userResp,
  //     });
  //     submitting.value = false;
  //     displayAlert(
  //       'info',
  //       user.value.id === null
  //         ? 'Utilizador cadastrado com sucesso'
  //         : 'Utilizador actualizado com sucesso.'
  //     );
  //   })
  //   .catch((error) => {
  //     submitting.value = false;
  //     displayAlert('error', error);
  //   });
  // } else {
  //   user.syncStatus = 'R'
  //   user.authorities = selectedRoles
  //     let userLocalBase = JSON.parse(JSON.stringify(user))
  //     console.log(userLocalBase)
  //     console.log(userLocalBase)
  //     userLocalBase = encrypt(userLocalBase)
  //     console.log(userLocalBase)
  //     UserLogin.localDbAddOrUpdate(userLocalBase).then(resp => {
  //       submitting = false
  //       UserLogin.insert({
  //           data: userLocalBase
  //       })
  //        displayAlert('info', user.id === null ? 'Utilizador cadastrado com sucesso' : 'Utilizador actualizado com sucesso.')
  //     })
  // }
};

const extractDatabaseCodes = () => {
  users.value.forEach((element) => {
    databaseCodes.value.push(element.username);
  });
};
const codeRules = (val) => {
  if (val === '') {
    return 'o nome do utilizador é obrigatorio';
  } else if (val.length < 3) {
    return 'O  nome do utilizador indicado deve ter no mínimo 3 caracteres';
  } else if (
    (databaseCodes.value.includes(val) && isEditStep.value) ||
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
