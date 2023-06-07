<template>
  <div>
    <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
      Perfis
    </div>
    <div class="">
      <q-table :rows="userRoles" :columns="columns" :filter="filter">
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
            <q-td key="description" :props="props">
              {{ props.row.name }}
            </q-td>
            <q-td key="description" :props="props">
              {{ props.row.description }}
            </q-td>
            <q-td key="options" :props="props">
              <div class="col">
                <q-btn
                  flat
                  round
                  color="amber-8"
                  icon="edit"
                  @click="editUser(props.row)"
                  v-if="props.row.active === true"
                >
                  <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="visualizeClinic(props.row)"
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
                    props.row.active ? 'Inactivar' : 'Activar'
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
          @click="addRole"
          no-cap
          color="primary"
        />
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showRoleRegistrationScreen">
      <addRoleComp @close="showRoleRegistrationScreen = false" />
    </q-dialog>
  </div>
</template>
<script setup>
/*Imports*/
import { useQuasar } from 'quasar';
import { ref, inject, provide, onMounted, computed, reactive } from 'vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import roleService from 'src/services/api/role/roleService.ts';

/*Components import*/
import addRoleComp from 'src/components/Settings/User/AddRole.vue';

/*Variables*/
const role = reactive(ref(roleService.newInstanceEntity()));
const { alertWarningAction } = useSwal();
const showRoleRegistrationScreen = ref(false);
const columns = [
  {
    name: 'name',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'description',
    required: true,
    label: 'Descricao',
    align: 'left',
    field: (row) => row.description,
    format: (val) => `${val}`,
    sortable: true,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];
const submitting = ref(false);

/*injects*/
const step = inject('step');
const editMode = inject('editMode');
const viewMode = inject('viewMode');
const currClinic = inject('currClinic');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const filter = inject('filter');

/*Provides*/
provide('isCreateStep', isCreateStep);
provide('selectedRole', role);
provide('showRoleRegistrationScreen', showRoleRegistrationScreen);

/*Hooks*/
const userRoles = computed(() => {
  return roleService.getAllWithMenus();
});

/*Methods*/
const getIconActive = (role) => {
  if (role.active) {
    return 'stop_circle';
  } else if (!role.active) {
    return 'play_circle';
  }
};
const getColorActive = (role) => {
  if (role.active) {
    return 'red';
  } else if (!role.active) {
    return 'green';
  }
};
const getTooltipClass = (role) => {
  if (role.active) {
    return 'bg-red-5';
  } else if (!role.active) {
    return 'bg-green-5';
  }
};

const visualizeClinic = (roleParam) => {
  role.value = roleParam;
  viewMode.value = true;
  editMode.value = false;
  isEditStep.value = false;
  isCreateStep.value = false;
  showRoleRegistrationScreen.value = true;
};

const editUser = (roleParam) => {
  role.value = roleParam;
  viewMode.value = false;
  editMode.value = true;
  isEditStep.value = true;
  isCreateStep.value = false;
  showRoleRegistrationScreen.value = true;
};

const addRole = () => {
  role.value = reactive(ref(roleService.newInstanceEntity()));
  editMode.value = false;
  viewMode.value = false;
  isCreateStep.value = true;
  isEditStep.value = false;
  showRoleRegistrationScreen.value = true;
};

const promptToConfirm = (role) => {
  const question = role.active
    ? 'Deseja Inactivar o Perfil?'
    : 'Deseja Activar o Perfil?';

  alertWarningAction(question).then((response) => {
    if (response) {
      if (role.active) {
        role.active = false;
      } else {
        role.active = true;
      }

      // if (this.mobile) {
      //          const roleLocalBase = JSON.parse(JSON.stringify(role));
      // Role.localDbAddOrUpdate(roleLocalBase).then((resp) => {
      //   Role.insert({
      //     data: roleLocalBase,
      //   });
      //   this.displayAlert('info', msg);
      // });
      //       } else {

      roleService
        .patch(role.id, role)
        .then((resp) => {
          submitting.value = false;
          showRoleRegistrationScreen.value = false;
        })
        .catch((error) => {
          submitting.value = false;
          showRoleRegistrationScreen.value = false;
        });
      // }
    }
  });
};
</script>
