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
              class="col"
              title="Funcionalidades"
              :rows="role.menus"
              :columns="columns1"
              row-key="code"
              v-if="onlyView"
              dense
            />
          </div>

          <q-table
            :rows="menus"
            :columns="columns"
            row-key="id"
            v-model:pagination="pagination"
            :rows-per-page-options="[8, 16, 0]"
            binary-state-sort
            flat
            bordered
            v-model:selected="role.menus"
            selection="multiple"
            class="my-sticky-header-table"
            dense
            v-if="!onlyView"
          >
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-teal text-white">
                <q-th auto-width class="bg-teal text-white">
                  <q-checkbox
                    v-model="selectAll"
                    @update:model-value="toggleAllMenus"
                  />
                </q-th>
                <q-th
                  class="bg-tea text-white text-subtitle1 text-weight-medium"
                >
                  Funcionalidades
                </q-th>
                <q-th auto-width class="bg-teal text-white"></q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width>
                  <q-checkbox v-model="props.selected" />
                </q-td>
                <q-td>
                  {{ props.row.description }}
                </q-td>
              </q-tr>

              <q-tr
                v-if="
                  props.selected && getSectionsForMenu(props.row.id).length > 0
                "
                :props="props"
              >
                <q-td colspan="100%">
                  <div class="text-subtitle2 q-py-sm q-px-lg">Seções UI:</div>

                  <!-- Categories -->
                  <div
                    v-for="category in getSectionsByCategories(props.row.id)"
                    :key="category.name"
                    class="q-mb-md"
                  >
                    <div
                      class="text-weight-medium q-pl-lg q-pb-sm text-primary"
                    >
                      {{ category.name }}
                    </div>
                    <div class="row q-col-gutter-md q-px-lg">
                      <div
                        class="col-6"
                        v-for="section in category.items"
                        :key="section.id"
                      >
                        <q-checkbox
                          :label="section.displayName"
                          :model-value="
                            isSectionSelected(props.row.id, section.id)
                          "
                          @update:model-value="
                            (val) => {
                              toggleSectionSelection(
                                props.row.id,
                                section,
                                val
                              );
                            }
                          "
                        />
                      </div>
                    </div>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
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
import { ref, inject, onMounted, computed, reactive, watch } from 'vue';
import roleService from 'src/services/api/role/roleService.ts';
import menuService from 'src/services/api/menu/menuService.ts';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import UiSectionService from 'src/services/api/menu/UiSectionService';
import Role from 'src/stores/models/userLogin/Role';

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
const sectionCategories = reactive({
  Paciente: ['Patient'],
  'Serviço Clínico': ['PatientServiceIdentifier'],
  Episódio: ['Episode'],
  'Prescrição & Dispensa': ['Prescription'],
  'Atenção Farmacêutica': ['PharmaceuticalAttention'],
  Entrada: ['Stock'],
  Inventario: ['Inventory'],
  Distribuição: ['Distribution'],
});
const databaseCodes = ref([]);
const databaseDescriptions = ref([]);
const submitting = ref(false);
const nomeRef = ref(null);
const descriptionRef = ref(null);
const expandedMenus = ref([]);
const selectAll = ref(false);
const selectedUiSections = ref(new Set());

/*Injects*/
const viewMode = inject('viewMode');
const isCreateStep = inject('isCreateStep');
const showRoleRegistrationScreen = inject('showRoleRegistrationScreen');
const role = inject('selectedRole');
const selectedRole = inject('selectedRole');
const isEditStep = inject('isEditStep');

const uiSectionMap = reactive({});

/*Hooks*/
const onlyView = computed(() => {
  return viewMode.value;
});

const userRoles = computed(() => {
  return roleService.getAllWithMenus();
});
const menus = computed(() => {
  const menus = menuService
    .getAllFromStorage()
    .filter((arrayItem) => arrayItem.code !== '08');

  return menus.map(({ pivot, ...menu }) => menu);
});

const uiSections = computed(() => {
  return UiSectionService.getAll();
});
/*
const uiSectionsByMenu = computed(() => {
  if ()
  return UiSectionService.getAllByMenu();
});
*/
const getSectionsForMenu = (menuId) => {
  return uiSections.value.filter((section) => section.menu_id === menuId);
};
onMounted(() => {
  if (isCreateStep.value) {
    role.value = new Role();
  } else if (isEditStep.value) {
    // toggleAllMenus();
    // role.menus.forEach(menu =)
    // handleMenuChange(role.value.menus, []);
    role.value.menus.forEach((menu) => {
      selectSectionsForMenuWhenEdit(menu.id);
    });
  }
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

  if (
    role.value.authority === null ||
    role.value.authority === undefined ||
    role.value.authority === ''
  )
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

const isSectionSelected = (menuId, sectionId) => {
  return uiSectionMap[menuId]?.includes(sectionId) ?? false;
};

const deselectAllSectionsOfMenu = (menuId) => {
  const list = uiSectionMap[menuId];
  // const index = list.indexOf(section.id);
  role.value.uiSections.forEach((uiSection) => {
    if (uiSection.menu_id === menuId) {
      const index = list.indexOf(uiSection.id);
      role.value.uiSections.splice(index, 1);
    }
  });
  delete uiSectionMap[menuId];
};

const toggleSectionSelection = (menuId, section, checked) => {
  if (!uiSectionMap[menuId]) {
    // Initialize an empty array for this menu if it doesn't exist
    uiSectionMap[menuId] = [];
  }

  let list = uiSectionMap[menuId];
  const index = list.indexOf(section.id);
  if (checked && index === -1) {
    if (section.menu_id === menuId && !list.includes(section.id)) {
      list.push(section.id);
      role.value.uiSections.push(section);
    }
  } else if (!checked && index !== -1) {
    if (section.menu_id === menuId) {
      list.splice(index, 1);
      role.value.uiSections.splice(index, 1);
    }
  }
};
const toggleSectionSelectionToEdit = (menuId, section, checked) => {
  if (!uiSectionMap[menuId]) {
    // Initialize an empty array for this menu if it doesn't exist
    uiSectionMap[menuId] = [];
  }

  let list = uiSectionMap[menuId];
  const index = list.indexOf(section.id);
  if (checked && index === -1) {
    if (section.menu_id === menuId && !list.includes(section.id)) {
      list.push(section.id);
      // role.value.uiSections.push(section);
    }
  }
};
const updateExpanded = (menuId, value) => {
  const menu = menus.value.find((m) => m.id === menuId);
  if (menu) {
    menu.expanded = value;
  }
};

const toggleAllMenus = () => {
  const newValue = selectAll.value;
  if (newValue === true) {
    menus.value.forEach((menu) => {
      menu.selected = newValue;
      role.value.menus.push(menu);
    });
  } else {
    role.value.menus = [];
  }
};
const updateSelectedStatus = () => {
  // Check if all menus are selected to update selectAll value
  selectAll.value = menus.value.every((menu) => menu.selected);
};

watch(
  () => role.value.menus,
  (newVal, oldVal) => handleMenuChange(newVal, oldVal),
  { deep: true }
);

const handleMenuChange = (newVal, oldVal) => {
  const oldIds = new Set(oldVal?.map((m) => m.id));
  const newIds = new Set(newVal?.map((m) => m.id));

  const deselected = [...oldIds].filter((id) => !newIds.has(id));

  const newlySelected = [...newIds].filter((id) => !oldIds.has(id));

  // Remove associated UI sections
  deselected.forEach((menuId) => {
    deselectAllSectionsOfMenu(menuId);
  });

  newlySelected.forEach((menuId) => {
    selectAllSectionsForMenu(menuId);
  });
};

const selectAllSectionsForMenu = (menuId) => {
  const sections = getSectionsForMenu(menuId);

  // If role.menuSections doesn't exist, initialize it
  if (!role.value.uiSections) {
    $set(this.role, 'menuSections', []);
  }

  // Add all sections for this menu to the selected sections
  sections.forEach((section) => {
    // Check if this section is already selected
    const alreadySelected = role.value.uiSections.some(
      (ms) => ms.menu_id === menuId && ms.section_id === section.id
    );

    // If not already selected, add it
    if (!alreadySelected) {
      // role.value.uiSections.push(section);
    }
    toggleSectionSelection(menuId, section, true);
  });
};

const selectSectionsForMenuWhenEdit = (menuId) => {
  role.value.uiSections.forEach((section) => {
    // Check if this section is already selected
    const alreadySelected = role.value.uiSections.some(
      (ms) => ms.menu_id === menuId && ms.section_id === section.id
    );

    // If not already selected, add it
    if (!alreadySelected) {
      // role.value.uiSections.push(section);
    }
    toggleSectionSelectionToEdit(menuId, section, true);
  });
};

const getSectionsByCategories = (menuId) => {
  // Get all sections for this menu
  const sections = getSectionsForMenu(menuId);

  // Initialize result structure with categories
  const categorizedSections = Object.keys(sectionCategories).map(
    (category) => ({
      name: category,
      items: [],
    })
  );

  // Add "Others" category for uncategorized items
  categorizedSections.push({ name: 'Outros', items: [] });

  // Categorize each section
  sections.forEach((section) => {
    let categorized = false;

    // Try to match section to a category
    for (const [category, patterns] of Object.entries(sectionCategories)) {
      // Check if section name/displayName matches any pattern for this category
      if (
        patterns.some(
          (pattern) =>
            (section.category || '').toLowerCase() === pattern.toLowerCase()
        )
      ) {
        // Add to matching category
        const categoryObj = categorizedSections.find(
          (cat) => cat.name === category
        );
        if (categoryObj) {
          categoryObj.items.push(section);
          categorized = true;
          break;
        }
      }
    }

    // If not categorized, add to "Others"
    if (!categorized) {
      categorizedSections
        .find((cat) => cat.name === 'Outros')
        .items.push(section);
    }
  });

  // Remove empty categories
  return categorizedSections.filter((category) => category.items.length > 0);
};
</script>

<style>
.fild-radius {
  border-radius: 5px;
}
</style>
