<template>
  <q-card style="width: 900px; max-width: 90vw">
    <form @submit.prevent="submitForm">
      <q-card-section class="q-pa-none bg-green-2">
        <div class="row items-center text-center text-subtitle1 q-pa-md">
          <div class="col text-bold text-grey-10 q-ml-sm">
            {{ !newPatient ? 'Actualizar' : 'Registar' }} Paciente
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row">
          <q-space />

          <q-select
            class="col-4 q-mt-md"
            dense
            outlined
            v-model="selectedDataSources"
            option-value="id"
            option-label="description"
            ref="dataSourceRef"
            :options="dataSources"
            label="Fonte de dados"
          />
        </div>
        <div class="q-mt-lg">
          <div class="row items-center q-mb-md">
            <q-icon name="person_outline" size="sm" />
            <span class="q-pl-sm text-subtitle2">Dados Pessoais</span>
          </div>
          <q-separator color="grey-13" size="1px" />
        </div>
        <div class="q-mt-md">
          <div class="row">
            <q-input
              label="Nome *"
              dense
              outlined
              class="col"
              ref="firstNamesRef"
              :rules="[(val) => !!val || 'Por favor indicar o nome']"
              v-model="patientReg.firstNames"
            />
            <q-input
              v-model="patientReg.middleNames"
              ref="middleNamesRef"
              dense
              outlined
              class="col q-ml-md"
              label="Sobre Nome "
            />
            <q-input
              ref="lastNamesRef"
              v-model="patientReg.lastNames"
              class="col q-ml-md"
              label="Apelido *"
              dense
              outlined
              :rules="[(val) => !!val || 'Por favor indicar o apelido']"
            />
          </div>
          <div class="row">
            <q-input
              dense
              outlined
              class="col"
              v-model="dateOfBirth"
              ref="birthDateRef"
              @update:model-value="ageCalculator()"
              label="Data de Nascimento *"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="dateOfBirth"
                      :options="optionsNonFutureDate"
                      mask="DD-MM-YYYY"
                      @update:model-value="ageCalculator()"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              v-model="ageCalculated"
              label="Idade"
              ref="idadeRef"
              @update:model-value="dateOfBirthCalculator()"
              class="col q-ml-md"
              dense
              outlined
              mask="##"
              :rules="[(val) => val >= 0 || 'Por favor indicar a idade']"
            />
            <q-select
              class="col q-ml-md"
              dense
              outlined
              ref="genderRef"
              :rules="[(val) => !!val || 'Por favor indicar o sexo']"
              v-model="patientReg.gender"
              :options="genders"
              label="Sexo *"
            />
          </div>
        </div>
        <div class="q-mt-lg">
          <div class="row items-center q-mb-md">
            <q-icon name="house" size="sm" />
            <span class="q-pl-sm text-subtitle2">Endereço</span>
          </div>
          <q-separator color="grey-13" size="1px" />
        </div>
        <div class="row q-mt-md">
          <q-select
            class="col"
            dense
            outlined
            @update:model-value="onChangeProvincia()"
            v-model="patientReg.province"
            ref="provinceRef"
            :rules="[(val) => !!val || 'Por favor indicar a Província']"
            input-debounce="0"
            :options="provinces"
            option-value="id"
            option-label="description"
            label="Provincia *"
          />
          <q-select
            class="col q-ml-md"
            dense
            outlined
            @update:model-value="onChangeDistrito()"
            v-model="patientReg.district"
            option-value="id"
            option-label="description"
            ref="districtRef"
            :rules="[(val) => !!val || 'Por favor indicar o Distrito']"
            :options="filterRedDistricts"
            label="Distrito/Cidade *"
            @filter="filterDistricts"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Sem Resultados
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-select
            class="col q-ml-md"
            :readonly="
              patientReg.district === null || patientReg.district === undefined
            "
            dense
            outlined
            :options="filterRedPostos"
            v-model="patientReg.postoAdministrativo"
            option-value="id"
            option-label="description"
            label="Posto Administivo"
            @filter="filterPostos"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Sem Resultados
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="row q-mt-md">
          <q-select
            class="col"
            dense
            outlined
            clearable
            :readonly="
              patientReg.district === null || patientReg.district === undefined
            "
            :options="filterRedBairros"
            v-model="patientReg.bairro"
            option-value="id"
            option-label="description"
            label="Localidade/Bairro"
            @filter="filterBairros"
            use-input
            hide-selected
            fill-input
            @new-value="createBairro"
            input-debounce="0"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Sem Resultados
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-input
            v-model="patientReg.address"
            label="Morada"
            dense
            outlined
            class="col q-ml-md"
          />
          <q-input
            v-model="patientReg.addressReference"
            label="Ponto de Referência"
            dense
            outlined
            class="col col q-ml-md"
          />
        </div>
        <div class="q-mt-lg">
          <div class="row items-center q-mb-md">
            <q-icon name="call" size="sm" />
            <span class="q-pl-sm text-subtitle2">Contacto</span>
          </div>
          <q-separator color="grey-13" size="1px" />
        </div>
        <div class="row q-mt-md">
          <q-input
            outlined
            class="col"
            ref="ref"
            dense
            label="Principal"
            v-model="patientReg.cellphone"
            maxlength="9"
            type="tel"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="phone_android" />
            </template>
          </q-input>
          <q-input
            outlined
            class="col q-ml-md"
            ref="ref"
            dense
            label="Alternativo"
            v-model="patientReg.alternativeCellphone"
            maxlength="9"
            type="tel"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="phone_android" />
            </template>
          </q-input>
        </div>
        <div class="q-mt-lg">
          <div class="row items-center q-mb-md">
            <q-icon name="key" size="sm" />
            <span class="q-pl-sm text-subtitle2">UUID OpenMRS</span>
          </div>
          <q-separator color="grey-13" size="1px" />
        </div>
        <div class="q-mt-md">
          <div class="row">
            <q-input
              label="UUID *"
              dense
              outlined
              flat
              class="col q-mr-md"
              ref="uuidRef"
              v-model="hisUUID"
              :disable="editUUID"
              style="height: 40px"
            />
            <q-btn
              @click="disableEditUUID()"
              color="primary"
              icon="edit"
              flat
              v-if="editUUID"
              :disable="false"
              style="height: 50px"
            >
              <q-tooltip class="bg-green-5">Editar UUID</q-tooltip>
            </q-btn>
            <q-btn
              :loading="submitUUID"
              color="primary"
              icon="done"
              flat
              v-if="!editUUID"
              @click="updateUUID(patientReg)"
            />
            <q-btn
              color="red"
              icon="clear"
              flat
              v-if="!editUUID"
              @click="
                editUUID = true;
                hisUUID = patientReg.hisUuid;
              "
            />
          </div>
        </div>
      </q-card-section>
      <q-card-section class="q-px-md"> </q-card-section>
      <q-card-actions align="right" class="q-mb-md q-mr-sm">
        <q-btn label="Cancelar" color="red" @click="closePatient" />
        <q-btn
          type="submit"
          :loading="submitLoading"
          label="Submeter"
          color="primary"
          :disable="!editUUID"
        />
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import moment from 'moment';
import districtService from 'src/services/api/districtService/districtService';
import provinceService from 'src/services/api/provinceService/provinceService';
import clinicService from 'src/services/api/clinicService/clinicService';
import postoAdministrativoService from 'src/services/api/postoAdministrativo/postoAdministrativoService';
import localidadeServive from 'src/services/api/bairro/bairroService';
import { usePatient } from 'src/composables/patient/patientMethods';
import Patient from 'src/stores/models/patient/Patient';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import patientService from 'src/services/api/patientService/patientService';
import TransferenceService from 'src/services/Transferences/TransferenceService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import episodeService from 'src/services/api/episode/episodeService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import packService from 'src/services/api/pack/packService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useRouter } from 'vue-router';
import { useLoading } from 'src/composables/shared/loading/loading';
import Localidade from 'src/stores/models/Localidade/Localidade';
import { v4 as uuidv4 } from 'uuid';

// Declaration
const { getYYYYMMDDFromJSDate, getDateFromHyphenDDMMYYYY } = useDateUtils();
const { hasIdentifiers, getOldestIdentifier } = usePatient();
const { alertSucess, alertError, alertInfo } = useSwal();
const { closeLoading, showloading } = useLoading();
const router = useRouter();
const dateOfBirth = ref('');
const ageCalculated = ref('');
const genders = ref(['Masculino', 'Feminino']);
const submitLoading = ref(false);
const patientReg = ref(new Patient({ id: uuidv4() }));
const filterRedDistricts = ref([]);
const filterRedPostos = ref([]);
const filterRedBairros = ref([]);
const editUUID = ref(true);
//Ref's
const firstNamesRef = ref(null);
const middleNamesRef = ref(null);
const lastNamesRef = ref(null);
const birthDateRef = ref(null);
const genderRef = ref(null);
const provinceRef = ref(null);
const districtRef = ref(null);
const idadeRef = ref(null);
const dataSourceRef = ref('');
const selectedDataSources = ref({
  id: -1,
  description: 'iDMED',
});
const hisUUID = ref('');
const oldHisUUID = ref('');
const dataSources = inject('dataSources');

// Inject
const patient = inject('patient');
const newPatient = inject('newPatient');
// const transferencePatientData = inject('transferencePatientData');
const closePatient = inject('closePatient');
const showPatientRegister = inject('showPatientRegister');
const openMrsPatient = inject('openMrsPatient');
const submitUUID = ref(false);
// Hook

onMounted(() => {
  initPatient();
  hisUUID.value = patientReg.value.hisUuid;
});

// Methods

const disableEditUUID = () => {
  editUUID.value = false;
};

const updateUUID = () => {
  if (hisUUID.value === null || hisUUID.value === undefined) {
    return alertError('Por favor, indicar o UUID do paciente.');
  }

  if (!isValidUUID(hisUUID.value)) {
    return alertError(
      'O UUID năo coincide com formato exigido: []{8}-[]{4}-[]{4}-[]{4}-[]{12}'
    );
  }

  submitUUID.value = true;
  patientReg.value.clinic = {};
  patientReg.value.clinic.id = currClinic.value.id;
  oldHisUUID.value = patientReg.value.hisUuid;
  // patientReg.value.identifiers = {};
  // patientReg.value.patientVisits = {};
  patientReg.value.hisUuid = hisUUID.value;
  patientService
    .updateUUID(patientReg.value, sessionStorage.getItem('Btoa'))
    .then(() => {
      alertSucess('UUID actualizado com Sucesso.');
      submitUUID.value = false;
      editUUID.value = true;
    })
    .catch((error) => {
      console.log('ERROR ', error);
      patientReg.value.hisUuid = oldHisUUID.value;
      hisUUID.value = oldHisUUID.value;
      alertError(error.response.data);
      submitUUID.value = false;
      editUUID.value = true;
    });
};

const optionsNonFutureDate = (dateOfBirth) => {
  return dateOfBirth <= moment().format('YYYY/MM/DD');
};
const onChangeProvincia = () => {
  // if (newPatient.value) {
  //   patientReg.value = new Patient({ id: uuidv4() });
  // }

  if (patientReg.value.province !== null) {
    if (patientReg.value.province.description !== patientReg.value.province) {
      patientReg.value.district = null;
      patientReg.value.bairro = null;
      patientReg.value.postoAdministrativo = null;
    }
  }
};
const onChangeDistrito = () => {
  if (patientReg.value.district !== null) {
    if (patientReg.value.district.description !== patientReg.value.district) {
      patientReg.value.bairro = null;
      patientReg.value.postoAdministrativo = null;
    }
  }
};
const createBairro = (val, done) => {
  if (val.length > 0) {
    const bairro = new Localidade({
      id: uuidv4(),
      code: val.toUpperCase(),
      description: val,
      postoAdministrativo: patientReg.value.postoAdministrativo,
    });
    if (!objectExistsOnArray(val, bairros)) {
      filterRedBairros.value.push(bairro);
    }
    done(bairro, 'toggle');
  }
};
const objectExistsOnArray = (description, array) => {
  if (array === null || array.length <= 0) return false;
  const exists = array.some((o) => {
    return o.description.toLowerCase() === description.toLowerCase();
  });
  return exists;
};
const filterPostos = (val, update, abort) => {
  const stringOptions = postos;
  if (val === '') {
    update(() => {
      filterRedPostos.value = stringOptions.value.map((posto) => posto);
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      filterRedPostos.value = [];
    });
  } else {
    update(() => {
      filterRedPostos.value = stringOptions.value
        .map((posto) => posto)
        .filter((posto) => {
          return (
            posto &&
            posto.description.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};

const filterDistricts = (val, update, abort) => {
  const stringOptions = districts;
  if (val === '') {
    update(() => {
      filterRedDistricts.value = stringOptions.value.map(
        (district) => district
      );
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      filterRedDistricts.value = [];
    });
  } else {
    update(() => {
      filterRedDistricts.value = stringOptions.value
        .map((district) => district)
        .filter((district) => {
          return (
            district &&
            district.description.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};
const filterBairros = (val, update, abort) => {
  const stringOptions = bairros;
  if (val === '') {
    update(() => {
      filterRedBairros.value = stringOptions.value.map((bairro) => bairro);
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      filterRedBairros.value = [];
    });
  } else {
    update(() => {
      filterRedBairros.value = stringOptions.value
        .map((bairro) => bairro)
        .filter((bairro) => {
          return (
            bairro &&
            bairro.description.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};
const submitForm = () => {
  submitLoading.value = true;
  firstNamesRef.value.validate();
  lastNamesRef.value.validate();
  genderRef.value.validate();
  provinceRef.value.validate();
  districtRef.value.validate();
  idadeRef.value.validate();

  if (
    !firstNamesRef.value.hasError &&
    !lastNamesRef.value.hasError &&
    !provinceRef.value.hasError &&
    !genderRef.value.hasError &&
    !districtRef.value.hasError &&
    !idadeRef.value.hasError
  ) {
    const dateObject = getYYYYMMDDFromJSDate(
      getDateFromHyphenDDMMYYYY(dateOfBirth.value)
    );
    patientReg.value.dateOfBirth = dateObject;
    if (
      !newPatient.value &&
      hasIdentifiers(patientReg.value) &&
      getYYYYMMDDFromJSDate(getOldestIdentifier(patientReg.value).startDate) <
        dateObject
    ) {
      alertError(
        'A data de nascimento indicada é maior que a data da admissão ao serviço se saúde [ ' +
          getOldestIdentifier(patientReg.value).service.code +
          ' ]'
      );
      submitLoading.value = false;
    } else {
      savePatient();
    }
  } else {
    submitLoading.value = false;
  }
};
const savePatient = async () => {
  if (newPatient.value && !openMrsPatient.value) {
    patientReg.value.identifiers = [];
  }
  if (
    patientReg.value.identifiers.length > 0 &&
    patientReg.value.identifiers[0].clinic === null
  ) {
    patientReg.value.identifiers = [];
  }
  patientReg.value.dateOfBirth = getYYYYMMDDFromJSDate(
    getDateFromHyphenDDMMYYYY(dateOfBirth.value)
  );
  if (
    patientReg.value.bairro !== null &&
    patientReg.value.bairro.district === null
  ) {
    patientReg.value.bairro.district = patientReg.value.district;
  }
  if (openMrsPatient.value) {
    patientReg.value.identifiers = patient.value.identifiers;
    const uuid = patientReg.value.hisUuid;
    patientService
      .apiopenmrsProgramSearch(
        patientReg.value.his.id,
        uuid,
        sessionStorage.getItem('Btoa')
      )
      .then((response) => {
        closeLoading();
        if (response.data.results.length > 0) {
          response.data.results.forEach((identifierOpenMrs) => {
            if (identifierOpenMrs.display === 'SERVICO TARV - TRATAMENTO') {
              editPatientIdentifierFromOpenMRS(
                patientReg.value,
                identifierOpenMrs
              );
            }
          });
          doSave();
        } else {
          closeLoading();
          alertInfo(
            'Não foi Encontrada a Data de Admissão para o serviço clinico , Será usada a data actual para efectuar a importação.'
          );
          doSave();
        }
      });
  } else {
    doSave();
  }
};
const doSave = async () => {
  patientReg.value.hisProvider = sessionStorage.getItem('Btoa');
  if (selectedDataSources.value.abbreviation === 'OpenMRS') {
    patientReg.value.his = {};
    patientReg.value.his.id = selectedDataSources.value.id;
    patientReg.value.hisSyncStatus = 'P';
  } else {
    patientReg.value.hisSyncStatus = 'N';
  }

  patientReg.value.clinic = {};
  patientReg.value.clinic.id = currClinic.value.id;
  patientReg.value.origin = currClinic.value.id;

  patientReg.value.identifiers.forEach((identifier) => {
    identifier.clinic = {};
    identifier.clinic.id = identifier.clinic_id;
    identifier.service = {};
    identifier.service.id = identifier.service_id;
    identifier.origin = currClinic.value.id;
  });

  if (newPatient.value) {
    patientReg.value.syncStatus = 'R';
    patientService
      .post(patientReg.value)
      .then(() => {
        // if (
        //   transferencePatientData !== undefined &&
        //   transferencePatientData.length > 0
        // ) {
        //   doPatientTranference(resp);
        // } else {
        alertSucess('Dados do paciente gravados com sucesso.');
        submitLoading.value = false;
        showPatientRegister.value = false;
        closePatient();
        goToPatientPanel(patientReg.value);
        // }
      })
      .catch((error) => {
        let listErrors = [];
        submitLoading.value = false;
        if (error.request !== undefined && error.request.status !== 0) {
          const arrayErrors = JSON.parse(error.request.response);
          if (arrayErrors.total == null) {
            listErrors.push(arrayErrors.message);
          } else {
            arrayErrors._embedded.errors.forEach((element) => {
              listErrors.push(element.message);
            });
          }
        }
        console.error(error);
        alertError('Ocorreu um problema ao gravar o paciente');
      });
  } else {
    patientReg.value.syncStatus = 'U';
    patientReg.value.identifiers = {};
    patientReg.value.patientVisits = {};
    oldHisUUID.value = patientReg.value.hisUuid;
    if (hisUUID.value !== null && hisUUID.value !== undefined) {
      patientReg.value.hisUuid = hisUUID.value;
    }
    patientService
      .patch(patientReg.value.id, patientReg.value)
      .then(() => {
        alertSucess('Dados do paciente Actualizados com sucesso.');
        closePatient();
        showPatientRegister.value = false;
        submitLoading.value = false;

        // }
      })
      .catch((error) => {
        let listErrors = [];
        patientReg.value.hisUuid = oldHisUUID.value;
        submitLoading.value = false;
        if (error.request !== undefined && error.request.status !== 0) {
          const arrayErrors = JSON.parse(error.request.response);
          if (arrayErrors.total == null) {
            listErrors.push(arrayErrors.message);
          } else {
            arrayErrors._embedded.errors.forEach((element) => {
              listErrors.push(element.message);
            });
          }
        }
        console.error(error, listErrors);
        alertError('Ocorreu um problema ao actualizar o paciente');
      });
  }
};

const goToPatientPanel = (patient) => {
  localStorage.setItem('patientuuid', patient.id);
  router.push('/patientpanel/');
};

const doPatientTranference = (resp) => {
  const psi = TransferenceService.buildPatientIdentifierFromIdmed(
    transferencePatientData[0]
  );
  psi.patient = patientReg.value;

  patientServiceIdentifierService.post(psi).then((respPatientSI) => {
    const episode = TransferenceService.buildEpisodeFromIdmed(
      transferencePatientData[0]
    );
    episode.patientServiceIdentifier = psi;
    episodeService.post(episode).then((respEpi) => {
      const patientVisit =
        TransferenceService.getPatientVisitWithDetailsPRescriptionAndPack(
          transferencePatientData[0]
        );
      prescriptionService
        .post(patientVisit.patientVisitDetails[0].prescription)
        .then((respPres) => {
          patientVisit.patientVisitDetails[0].prescription.id =
            respPres.response.data.id;
          patientVisit.patientVisitDetails[0].prescription.$id =
            respPres.response.data.id;
          packService
            .post(patientVisit.patientVisitDetails[0].pack)
            .then((respPack) => {
              patientVisit.patientVisitDetails[0].pack.id =
                respPack.response.data.id;
              patientVisit.patientVisitDetails[0].pack.$id =
                respPack.response.data.id;
              patientVisit.patientVisitDetails[0].episode =
                respEpi.response.data;
              patientVisit.patientVisitDetails[0].episode.id =
                respEpi.response.data.id;
              patientVisit.patientVisitDetails[0].episode.$id =
                respEpi.response.data.id;
              patientVisit.patient = patientReg;
              patientVisit.patient.id = resp.response.data.id;
              patientVisit.patient.$id = resp.response.data.id;

              patientVisitService.post(patientVisit).then((resp) => {
                alertSucess('Dados do paciente gravados com sucesso.');
                submitLoading.value = false;
              });
            });
        });
    });
  });
};

const initPatient = () => {
  if (!newPatient.value) {
    patientReg.value = patient.value;
    patientReg.value.clinic = currClinic.value;
    patientReg.value.province = currClinic.value.province;
    dateOfBirth.value = moment(patientReg.value.dateOfBirth).format(
      'DD-MM-YYYY'
    );
    ageCalculated.value = moment().diff(
      moment(getDateFromHyphenDDMMYYYY(dateOfBirth.value), 'YYYY-MM-DD'),
      'years'
    );
  } else {
    if (
      openMrsPatient.value !== undefined &&
      openMrsPatient.value !== null &&
      openMrsPatient.value
    ) {
      patientReg.value = patient.value;
      dateOfBirth.value = moment(patientReg.value.dateOfBirth).format(
        'DD-MM-YYYY'
      );
      ageCalculated.value = moment().diff(
        moment(getDateFromHyphenDDMMYYYY(dateOfBirth.value), 'YYYY-MM-DD'),
        'years'
      );
    } else {
      patientReg.value = new Patient({ id: uuidv4() });
    }
    patientReg.value.clinic = currClinic.value;
    patientReg.value.province = currClinic.value.province;
  }
};

const editPatientIdentifierFromOpenMRS = (patientReg, identifierOpenMrs) => {
  patientReg.identifiers.forEach((identifier) => {
    if (
      identifier.service.code === 'TARV' &&
      identifierOpenMrs.display === 'SERVICO TARV - TRATAMENTO'
    ) {
      identifier.startDate = identifierOpenMrs.dateEnrolled;
    }
  });
};

const dateOfBirthCalculator = () => {
  if (
    ageCalculated.value !== null &&
    ageCalculated.value !== undefined &&
    ageCalculated.value !== ''
  ) {
    dateOfBirth.value = moment(
      '01-01-' + (moment().year() - ageCalculated.value)
    ).format('DD-MM-YYYY');
  } else {
    dateOfBirth.value = '';
  }
};

const ageCalculator = () => {
  if (
    dateOfBirth.value !== null &&
    dateOfBirth.value !== undefined &&
    dateOfBirth.value !== ''
  ) {
    ageCalculated.value = moment().diff(
      moment(getDateFromHyphenDDMMYYYY(dateOfBirth.value), 'YYYY-MM-DD'),
      'years'
    );
  } else {
    ageCalculated.value = '';
  }
};

// Computed
const currClinic = computed(() => {
  return clinicService.currClinic();
});
const provinces = computed(() => {
  return provinceService.getAllProvinces();
});
const districts = computed(() => {
  if (
    patientReg.value.province !== null &&
    patientReg.value.province !== undefined
  ) {
    return districtService.getAllDistrictByProvinceId(
      patientReg.value.province.id
    );
  } else {
    return null;
  }
});
const postos = computed(() => {
  if (
    patientReg.value.district !== null &&
    patientReg.value.district !== undefined
  ) {
    return postoAdministrativoService.getAllDistrictById(
      patientReg.value.district.id
    );
  } else {
    return null;
  }
});
const bairros = computed(() => {
  if (
    patientReg.value.postoAdministrativo !== null &&
    patientReg.value.postoAdministrativo !== undefined
  ) {
    return localidadeServive.getAllPostoAdministrativoById(
      patientReg.value.postoAdministrativo.id
    );
  } else if (
    patientReg.value.district !== null &&
    patientReg.value.district !== undefined
  ) {
    return localidadeServive.getAllDistrictById(patientReg.value.district.id);
  } else {
    return null;
  }
});

const isValidUUID = (uuidString) => {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuidString);
};
</script>

<style></style>
