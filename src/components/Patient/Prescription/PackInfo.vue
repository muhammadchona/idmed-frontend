<template>
  <div>
    <q-expansion-item
      v-if="pack !== null"
      dense
      header-class="bg-grey-6 text-white text-bold vertical-middle q-pl-md"
      expand-icon-class="text-white"
      default-opened
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon color="white" name="add_task" />
        </q-item-section>

        <q-item-section>
          Data de Levantamento: {{ formatDate(pack.pickupDate) }}
          {{
            String(prescription?.clinic?.id) !== prescription.origin
              ? ' - [ Origem da Dispensa: '.concat(getOriginClinic).concat(']')
              : ''
          }}
        </q-item-section>
      </template>
      <q-card flat v-if="pack !== null" bordered class="noRadius">
        <q-card-section class="row q-pa-sm">
          <div class="col-12">
            <q-table
              class="col"
              dense
              flat
              unelevated
              :rows="packagedDrugRows"
              :columns="columns"
              row-key="id"
              hide-bottom
            >
              <template #body="props">
                <q-tr no-hover :props="props">
                  <q-td key="drug" :props="props">
                    {{ formatPackagedDrugName(props.row) }}
                  </q-td>
                  <q-td key="qty" :props="props">
                    {{ props.row.quantitySupplied }}
                    <em
                      v-if="
                        getPackagedDrugDetails(props?.row?.drug?.id)
                          ?.clinicalService?.code === 'TARV'
                      "
                    >
                      Frasco(s)</em
                    >
                    <em v-else
                      >{{
                        getPackagedDrugDetails(props?.row?.drug?.id)?.form
                          ?.description
                      }}(s)</em
                    >
                  </q-td>
                  <q-td auto-width key="nextPickUpDate" :props="props">
                    {{
                      props.row.toContinue
                        ? formatDate(pack.nextPickUpDate)
                        : 'Não continua'
                    }}
                  </q-td>
                  <q-td key="quantityRemain" :props="props">
                    <em
                      v-if="
                        getPackagedDrugDetails(props?.row?.drug?.id)
                          ?.clinicalService?.code === 'TARV'
                      "
                    >
                      {{
                        totalQuantityRemainFrascos(
                          getPackagedDrugDetails(props?.row?.drug?.id)
                        )
                      }}
                      Frasco(s) e
                      {{
                        totalUnityRemains(
                          getPackagedDrugDetails(props?.row?.drug?.id)
                        ) +
                        ' ' +
                        getPackagedDrugDetails(props?.row?.drug?.id)?.form?.unit
                      }}
                    </em>
                    <em v-else
                      >{{
                        totalQuantityRemainFrascos(
                          getPackagedDrugDetails(props?.row?.drug?.id)
                        )
                      }}
                      {{
                        getPackagedDrugDetails(props?.row?.drug?.id)?.form
                          ?.description
                      }}(s)</em
                    >
                  </q-td>
                  <q-td
                    :rowspan="packagedDrugRows.length"
                    auto-width
                    key="opts"
                    :props="props"
                  >
                    <div class="col">
                      <q-btn
                        flat
                        @click.stop="removePack"
                        round
                        color="red"
                        icon="delete"
                        v-if="canRemovePack"
                      >
                        <q-tooltip class="bg-red">Remover</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
    <q-separator />
  </div>
</template>

<script setup>
import { date } from 'quasar';
import { useDrug } from 'src/composables/drug/drugMethods';
import clinicService from 'src/services/api/clinicService/clinicService';
import drugService from 'src/services/api/drugService/drugService';
import packService from 'src/services/api/pack/packService';
import packagedDrugService from 'src/services/api/packagedDrug/packagedDrugService';
import PermissionService from 'src/services/api/user/PermissionService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import formService from 'src/services/api/formService/formService';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import { computed, inject, provide, ref, watch } from 'vue';
//Declaration

const { getDrugFirstLevelById } = useDrug();
const { isMobile, isOnline } = useSystemUtils();
const columns = [
  {
    name: 'drug',
    required: true,
    field: 'name',
    label: 'Medicamento',
    align: 'left',
    sortable: true,
  },
  {
    name: 'qty',
    align: 'left',
    field: 'quantitySupplied',
    label: 'Quantidade',
    sortable: true,
  },
  {
    name: 'nextPickUpDate',
    align: 'left',
    field: 'nextPickUpDate',
    label: 'Próximo Levantamento',
    sortable: false,
  },
  {
    name: 'quantityRemain',
    align: 'center',
    field: 'quantityRemain',
    label: 'Sobra',
    sortable: false,
  },
  ,
  { name: 'opts', align: 'left', label: 'Opções', sortable: false },
];
const canEdit = ref(true);
const title = ref('Prescrição');
const titleEmptyList = ref('Nenhuma Prescrição Adicionada');
const bgColor = ref('bg-grey-6');

//Inject
const pack = inject('lastPackOnPrescription');
const curIdentifier = inject('curIdentifier');
const removePack = inject('removePack');
const prescription = inject('prescription');

// Offline packs are kept in Dexie and are intentionally not all loaded into
// Pinia. Load only the rows for the pack currently rendered on the tablet.
// The online/web relation remains the source of truth for the web version.
const mobilePackagedDrugs = ref([]);
let loadedMobilePackId = null;

watch(
  () => [pack.value?.id, isOnline.value],
  async ([packId, online]) => {
    if (online || !packId) return;
    if (loadedMobilePackId === packId) return;

    mobilePackagedDrugs.value = [];
    try {
      // This targeted lookup hydrates the drug, form and clinical service but
      // deliberately avoids saving through Pinia, which is costly on tablets.
      const hydratedRows = await packagedDrugService.getAllByIDsFromDexie([
        packId,
      ]);
      const localPack =
        hydratedRows.length > 0
          ? null
          : await packService.getPackMobileById(packId);
      const sourceRows =
        hydratedRows.length > 0
          ? hydratedRows
          : localPack?.packagedDrugs ?? [];
      const rows = await Promise.all(
        sourceRows.map(async (row) => {
          if (row?.drug?.name) return row;

          const drugId = row?.drug?.id ?? row?.drug_id;
          if (!drugId) return row;

          try {
            const fullDrug = await drugService.getMobileDrugByIdOrBackend(
              drugId
            );
            return { ...row, drug: fullDrug ?? row?.drug };
          } catch (error) {
            console.error('Unable to hydrate historical drug', error);
            return row;
          }
        })
      );
      mobilePackagedDrugs.value = rows ?? [];
      loadedMobilePackId = packId;
    } catch (error) {
      console.error('Unable to load packaged drugs for the offline pack', error);
    }
  },
  { immediate: true }
);

const packagedDrugRows = computed(() => {
  const relationRows = pack.value?.packagedDrugs ?? [];
  if (isOnline.value || relationRows.length > 0) {
    return relationRows;
  }
  return mobilePackagedDrugs.value;
});

const packagedDrugDetailsById = computed(() => {
  const details = new Map();
  packagedDrugRows.value.forEach((item) => {
    const drugId = item?.drug?.id ?? item?.drug_id;
    if (drugId && !details.has(drugId)) {
      if (isMobile.value && !isOnline.value) {
        const baseDrug =
          item?.drug?.name && item?.drug?.form_id
            ? item.drug
            : drugService.getCleanDrugById(drugId) ?? item?.drug;
        details.set(
          drugId,
          baseDrug
            ? {
                ...baseDrug,
                form:
                  baseDrug.form ?? formService.getFormById(baseDrug.form_id),
                clinicalService:
                  baseDrug.clinicalService ??
                  clinicalServiceService.getClinicalServiceById(
                    baseDrug.clinical_service_id
                  ),
              }
            : baseDrug
        );
      } else {
        details.set(drugId, getDrugFirstLevelById(drugId) ?? item?.drug);
      }
    }
  });
  return details;
});

const getPackagedDrugDetails = (drugId) =>
  packagedDrugDetailsById.value.get(drugId);

const formatPackagedDrugName = (row) => {
  const drugId = row?.drug?.id ?? row?.drug_id;
  const drug = getPackagedDrugDetails(drugId) ?? row?.drug;
  if (!drug?.name) return 'Medicamento não disponível';

  const formPrefix = String(drug?.form?.description ?? '').substring(0, 4);
  if (!formPrefix || drug.name.includes(formPrefix)) return drug.name;
  return `${drug.name} - (${drug.packSize} ${formPrefix})`;
};

const getOriginClinic = computed(() => {
  const clinic = clinicService.getById(prescription.value.origin);
  return clinic?.clinicName;
});

// Methods
const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};

const totalRemainAcumulado = (drug) => {
  if (!drug?.id) return 0;
  let totalAcumulado = 0;
  packagedDrugRows.value.find((itemLastPackagedDrug) => {
    if (drug.id === itemLastPackagedDrug?.drug?.id) {
      totalAcumulado = Number(itemLastPackagedDrug.quantityRemain);
    }
  });
  return totalAcumulado;
};
const totalQuantityRemainFrascos = (drug) => {
  const packSize = Number(drug?.packSize);
  if (!Number.isFinite(packSize) || packSize <= 0) return 0;
  return Math.floor(totalRemainAcumulado(drug) / packSize);
};

const totalUnityRemains = (drug) => {
  const packSize = Number(drug?.packSize);
  if (!Number.isFinite(packSize) || packSize <= 0) return 0;
  return totalRemainAcumulado(drug) % packSize;
};

const canRemovePack = computed(() => {
  if (isOnline.value) {
    return PermissionService.canPerformUiAction('prescription', 'remove');
  } else {
    return true;
  }
});

provide('bgColor', bgColor);
</script>

<style></style>
