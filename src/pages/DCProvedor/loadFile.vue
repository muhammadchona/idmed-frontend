<template>
  <div>
    <div class="q-mt-lg">
      <TitleBar />
      <div class="q-mx-xl">
        <div class="row">
          <q-space />
        </div>
        <div class="row items-center q-my-md">
          <q-icon name="person_outline" size="sm" />
          <span class="q-pl-sm text-subtitle2">Carregamento do Ficheiro</span>
        </div>
        <div class="q-mt-md">
          <div class="row">
            <q-select
              class="col"
              dense
              outlined
              v-model="selectedClinicSectorType"
              use-input
              ref="clinicSectorTypeRef"
              input-debounce="0"
              :options="clinicSectorTypes"
              option-value="id"
              option-label="description"
              label="Tipo de Sector de Dispensa"
              :rules="[
                (val) =>
                  !!val || 'Por favor indicar o tipo de sector de dispensa.',
              ]"
              @update:model-value="selectedClinicSector = null"
              :disable="submitSend"
            >
              <template v-if="selectedClinicSectorType" v-slot:append>
                <q-icon
                  name="cancel"
                  @click.stop.prevent="selectedClinicSectorType = null"
                  class="cursor-pointer"
                />
              </template>
            </q-select>
            <q-select
              class="col q-ml-md"
              dense
              outlined
              ref="referealClinicSectorRef"
              :rules="[
                (val) => !!val || 'Por favor indicar o sector de dispensa.',
              ]"
              v-model="selectedClinicSector"
              :options="referealClinicSectors"
              option-value="id"
              option-label="clinicName"
              label="Sector de Dispensa"
              :disable="submitSend"
            >
              <template v-if="selectedClinicSector" v-slot:append>
                <q-icon
                  name="cancel"
                  @click.stop.prevent="selectedClinicSector = null"
                  class="cursor-pointer"
                />
              </template>
            </q-select>
          </div>
          <div class="row">
            <q-file
              v-model="file"
              outlined
              label="Seleccione o Ficheiro"
              accept=".xls,.xlsx"
              counter
              dense
              class="col"
              ref="fileRef"
              :rules="[(val) => !!val || 'Por favor indicar o ficheiro.']"
              @update:model-value="excelExport"
              :disable="submitSend"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-if="file" v-slot:append>
                <q-icon
                  name="cancel"
                  @click.stop.prevent="file = null"
                  class="cursor-pointer"
                />
              </template>
            </q-file>
            <q-select
              class="col q-ml-md"
              dense
              outlined
              ref="selectedSheetRef"
              :rules="[(val) => !!val || 'Por favor indicar a planilha.']"
              v-model="selectedSheet"
              :options="sheets"
              label="Planilha"
              :disable="submitSend"
            >
              <template v-if="selectedSheet" v-slot:append>
                <q-icon
                  name="cancel"
                  @click.stop.prevent="selectedSheet = null"
                  class="cursor-pointer"
                />
              </template>
            </q-select>
          </div>
          <div class="row reverse q-mb-sm q-mt-sm q-gutter-sm">
            <q-btn label="Limpar" color="red" @click="cleanForm" />
            <q-btn
              unelevated
              color="primary"
              label="Carregar"
              class="all-pointer-events"
              :loading="submitLoading"
              :disable="submitSend"
              @click="loadList()"
            />
          </div>
        </div>

        <div class="q-mt-lg q-mb-md">
          <div class="row items-center q-mb-md">
            <q-icon name="search" size="sm" />
            <span class="q-pl-sm text-subtitle2">Resultado da Pesquisa</span>
          </div>
          <q-separator color="grey-13" size="1px" />
        </div>
        <div>
          <q-table
            class="col"
            dense
            :rows="getRows"
            :columns="columns"
            row-key="id"
            :filter="filter"
          >
            <template v-slot:no-data="{ icon, filter }">
              <div
                class="full-width row flex-center text-primary q-gutter-sm text-body2"
              >
                <span> Sem resultados para visualizar </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
            <template #body="props">
              <q-tr
                :props="props"
                :class="
                  props.row.existInIDMED
                    ? 'text-primary'
                    : 'text-italic text-red'
                "
              >
                <q-td key="identifier" :props="props">
                  {{ props.row.identifier }}
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
                <q-td key="gender" :props="props">
                  {{ props.row.gender }}
                </q-td>
                <q-td key="age" :props="props">
                  {{ props.row.age }}
                </q-td>
                <q-td key="lastPickup" :props="props">
                  {{ props.row.lastPickup }}
                </q-td>
                <q-td key="type" :props="props">
                  {{ props.row.type }}
                </q-td>
                <q-td key="status" :props="props">
                  {{ props.row.status }}
                </q-td>
                <q-td key="sync" :props="props">
                  <span v-if="submitStatus">
                    <span v-if="props.row.processed">
                      <span v-if="props.row.sync">
                        <q-icon
                          name="task_alt"
                          style="font-size: 1.5em"
                          color="primary"
                        >
                        </q-icon>
                      </span>
                      <span v-else>
                        <q-icon
                          name="cancel"
                          style="font-size: 1.5em"
                          color="red"
                        >
                          <q-tooltip
                            transition-show="rotate"
                            transition-hide="rotate"
                            anchor="bottom middle"
                            self="center middle"
                          >
                            <strong>
                              O Paciente não foi encontrado no iDMED</strong
                            >
                          </q-tooltip>
                        </q-icon>
                      </span>
                    </span>
                    <span v-else>
                      <q-spinner-ios color="primary" />
                    </span>
                  </span>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
        <div class="row justify-end q-mt-lg q-mb-md">
          <q-btn
            type="submit"
            :disable="enableSend"
            icon="send"
            label="Enviar"
            color="primary"
            @click="sendList"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import * as XLSX from 'xlsx';
import { computed, onMounted, provide, ref } from 'vue';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import TitleBar from 'src/components/Shared/TitleBar.vue';
import clinicSectorTypeService from 'src/services/api/clinicSectorTypeService/clinicSectorTypeService';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService';
import clinicService from 'src/services/api/clinicService/clinicService';
import patientService from 'src/services/api/patientService/patientService';
import Patient from 'src/stores/models/patient/Patient';
import { v4 as uuidv4 } from 'uuid';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import patientTransReferenceService from 'src/services/api/patientTransReferenceService/patientTransReferenceService';

const { alertSucess, alertError, alertInfo } = useSwal();
const { closeLoading, showloading } = useLoading();
const { website, isOnline, isMobile } = useSystemUtils();

//Declaration

const filter = ref('');
const title = ref(
  'Referência de Pacientes para Dispensa Comunitária pelo Provedor'
);

const file = ref(null);
const selectedSheet = ref('');
const selectedFile = ref('');
const sheets = ref([]);
const selectedClinicSectorType = ref(null);
const selectedClinicSector = ref(null);
const selectedList = ref([]);
const loadedList = ref([]);
const submitLoading = ref(false);
const submitSend = ref(false);
const submitStatus = ref(false);

//Refs

const fileRef = ref(null);
const clinicSectorTypeRef = ref(null);
const referealClinicSectorRef = ref(null);
const selectedSheetRef = ref(null);

const columns = [
  {
    name: 'identifier',
    align: 'left',
    label: 'Identificador',
    sortable: false,
  },
  {
    name: 'name',
    align: 'left',
    label: 'Nome',
    sortable: false,
  },
  { name: 'gender', align: 'left', label: 'Sexo', sortable: false },
  { name: 'age', align: 'center', label: 'Idade', sortable: false },
  {
    name: 'lastPickup',
    align: 'center',
    label: 'Último Levantamento',
    sortable: false,
  },
  {
    name: 'type',
    align: 'center',
    label: 'Tipo',
    sortable: false,
  },
  { name: 'status', align: 'left', label: 'Estado', sortable: false },
  { name: 'sync', align: 'left', label: 'Sincronzado?', sortable: false },
];

//Injection

// Hooks
onMounted(() => {
  showloading();
  closeLoading();
});

//Computed
const clinicSectorTypes = computed(() => {
  return clinicSectorTypeService.getClinicSectorTypesByCode('PROVEDOR');
});
const referealClinicSectors = computed(() => {
  if (selectedClinicSectorType.value === null) return [];
  return clinicSectorService.getClinicSectorsByFacilityTypeId(
    currClinic.value.id,
    selectedClinicSectorType.value.id
  );
});
const currClinic = computed(() => {
  return clinicService.currClinic();
});
// Methods

const cleanForm = () => {
  submitLoading.value = false;
  submitSend.value = false;
  submitStatus.value = false;
  selectedList.value = [];
  loadedList.value = [];
  file.value = null;
  selectedSheet.value = null;
  selectedFile.value = null;
  sheets.value = [];
  selectedClinicSectorType.value = null;
  selectedClinicSector.value = null;
};

const excelExport = (event) => {
  var input = event;
  var reader = new FileReader();
  reader.onload = () => {
    var fileData = reader.result;
    selectedFile.value = XLSX.read(fileData, { type: 'binary' });
    sheets.value = selectedFile.value.SheetNames;
  };
  reader.readAsBinaryString(input);
};

const sendList = () => {
  submitSend.value = true;
  submitStatus.value = true;
  //  countPatients.value = selectedList.value.length;
  selectedList.value.forEach((loadedPatient) => {
    if (loadedPatient.existInIDMED) {
      patientTransReferenceService
        .apiSendLostFolowUp(loadedPatient)
        .then((resp) => {
          loadedPatient.processed = true;
          loadedPatient.sync = true;
        })
        .catch((error) => {
          if (error.response.status === 409) {
            console.log(error);
            loadedPatient.sync = false;
            loadedPatient.processed = true;
            loadedPatient.status = 'O paciente ja foi carregado para o iDMED.';
          } else {
            loadedPatient.sync = false;
            loadedPatient.processed = true;
            loadedPatient.status = 'Histórico Cliníco Inválido.';
          }
        });
    } else {
      loadedPatient.sync = false;
      loadedPatient.processed = true;
      loadedPatient.status = 'Não foi encontrado no iDMED.';
    }
  });
};

const loadList = () => {
  submitLoading.value = true;
  fileRef.value.validate();
  clinicSectorTypeRef.value.validate();
  referealClinicSectorRef.value.validate();
  selectedSheetRef.value.validate();

  if (
    !fileRef.value.hasError &&
    !clinicSectorTypeRef.value.hasError &&
    !referealClinicSectorRef.value.hasError &&
    !selectedSheetRef.value.hasError
  ) {
    selectedList.value = [];
    loadedList.value = [];
    const worksheet = selectedFile.value.Sheets[selectedSheet.value];
    var range = XLSX.utils.decode_range(worksheet['!ref']);

    range.s.r = 2;
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    const getRowsFromFile = XLSX.utils.sheet_to_json(worksheet, {
      range: range,
      raw: false,
      defval: '',
    });

    getRowsFromFile.forEach(async (element) => {
      showloading();
      var objectListed = {};
      const currPatient = new Patient({ id: uuidv4() });
      const patientServiceIdentifier = new PatientServiceIdentifier({
        id: uuidv4(),
      });
      patientServiceIdentifier.value = element.NID;
      currPatient.identifiers.push(patientServiceIdentifier);
      objectListed.identifier = element.NID;
      objectListed.name = element.Nome;
      objectListed.gender = element.Sexo;
      objectListed.age = element.Idade;
      objectListed.lastPickup = element['Último Levant'];
      objectListed.type = element.Tipo;
      objectListed.destinationId = selectedClinicSector.value.id;
      objectListed.existInIDMED = await patientService.apiSearchExist(
        currPatient
      );
      objectListed.status = objectListed.existInIDMED
        ? 'Encontrado'
        : 'Não Encontrado';
      objectListed.processed = false;

      if (element.Tipo !== 'Activo') {
        selectedList.value.push(objectListed);
        if (objectListed.existInIDMED) {
          loadedList.value.push(objectListed);
        }
      }
    });

    submitLoading.value = false;
  } else {
    alertError('Todos os campos à vemelho devem ser preenchidos');
    submitLoading.value = false;
  }
};

const getRows = computed(() => {
  return selectedList.value;
});

const enableSend = computed(() => {
  return loadedList.value.length <= 0;
});

provide('title', title);
</script>
