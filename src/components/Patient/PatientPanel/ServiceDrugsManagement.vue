<template>
  <div>
    <PrescriptionDrugsListHeader
      :addVisible="true"
      :mainContainer="false"
      bgColor="bg-grey-6"
      :duration="duration"
      :newPickUpDate="newPickUpDate"
      @updateQtyPrescribed="updateQtyPrescribed"
      :visitDetails="visitDetails"
      @showAdd="addEditDrugs"
      :step="stepp"
    >
      Medicamentos para
      {{ visitDetails.episode.patientServiceIdentifier.service.code }}
    </PrescriptionDrugsListHeader>
    <div class="col prescription-box q-pa-md q-mb-md">
      <q-table
        class="col"
        dense
        :rows="prescribedDrugs"
        :columns="columns"
        row-key="id"
        hide-bottom
        flat
      >
        <template #header="props">
          <q-tr class="text-left bg-green-2" :props="props">
            <q-th>{{ columns[0].label }}</q-th>
            <q-th>{{ columns[1].label }}</q-th>
            <q-th v-if="!visitDetails.createPackLater">{{
              columns[2].label
            }}</q-th>
            <q-th v-if="!visitDetails.createPackLater">{{
              columns[3].label
            }}</q-th>
            <q-th>{{ columns[4].label }}</q-th>
          </q-tr>
        </template>
        <template #body="props">
          <q-tr no-hover :props="props">
            <q-td key="drug" :props="props">
              {{ props.row.drug.name }}
            </q-td>
            <q-td key="dosage" :props="props">
              {{
                props.row.amtPerTime +
                ' - ' +
                props.row.timesPerDay +
                ' X por ' +
                props.row.form
              }}
            </q-td>
            <q-td
              v-if="!visitDetails.createPackLater"
              auto-width
              key="packs"
              :props="props"
            >
              {{ props.row.getQtyPrescribed(drugsDuration) }}
            </q-td>
            <q-td
              v-if="!visitDetails.createPackLater"
              key="nextPickUpDate"
              :props="props"
            >
              <div class="row">
                <q-toggle v-model="props.row.toContinue" label="Continua" />
              </div>
            </q-td>
            <q-td key="options" :props="props">
              <q-btn
                flat
                round
                color="red"
                icon="delete"
                @click="deleteRow(props.row)"
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <q-dialog persistent v-model="showAddEditDrug">
      <AddEditPrescribedDrug
        @addPrescribedDrug="addPrescribedDrug"
        :visitDetails="curVisitDetails"
        :hasTherapeuticalRegimen="hasTherapeuticalRegimen"
        @close="showAddEditDrug = false"
      />
    </q-dialog>
    <q-dialog v-model="alert.visible">
      <Dialog :type="alert.type" @closeDialog="closeDialog">
        <template v-slot:title> Informação</template>
        <template v-slot:msg> {{ alert.msg }} </template>
      </Dialog>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import PrescribedDrug from '../../../store/models/prescriptionDrug/PrescribedDrug';
import Duration from '../../../store/models/Duration/Duration';
import Prescription from '../../../store/models/prescription/Prescription';
import Stock from '../../../store/models/stock/Stock';
import PatientVisitDetails from '../../../store/models/patientVisitDetails/PatientVisitDetails';
import Drug from '../../../store/models/drug/Drug';
import AddEditPrescribedDrug from 'components/Patient/PatientPanel/AddEditPrescribedDrug.vue';
import Dialog from 'components/Shared/Dialog/Dialog.vue';
import PrescriptionDrugsListHeader from 'components/Patient/Prescription/PrescriptionDrugsListHeader.vue';

//Declaration

const columns = [
  {
    name: 'drug',
    align: 'left',
    field: 'row.drug.name',
    label: 'Medicamento',
    sortable: true,
  },
  {
    name: 'dosage',
    align: 'left',
    field: 'row.amtPerTime',
    label: 'Toma',
    sortable: false,
  },
  {
    name: 'packs',
    align: 'center',
    style: 'width: 20px',
    field: 'row.qtyPrescribed',
    label: 'Quantidade em (Frascos)',
    sortable: false,
  },
  {
    name: 'nextPickUpDate',
    align: 'left',
    field: 'row.toContinue',
    label: 'Próx. Levantamento',
    sortable: false,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];
const showAddEditDrug = ref(false);
const curVisitDetails = ref('');
const nextPUpDate = ref('');
const pickupDate = ref('');
const prescribedDrugs = ref([]);
const nums = ref(
  Array(4)
    .fill()
    .map((x, i) => i + 1)
);
const drugsDuration = ref('');
const currPrescription = ref('');

// Injection
const visitDetails = inject('visitDetails');
const hasTherapeuticalRegimen = inject('hasTherapeuticalRegimen');
const oldPrescribedDrugs = inject('oldPrescribedDrugs');
const lastPack = inject('lastPack');
const prescription = inject('prescription');
const stepp = inject('stepp');
const visitClone = inject('visitClone');
const isAlreadyEdited = inject('isAlreadyEdited');

//Methods
const addEditDrugs = (pickupDate, nextPDate, duration) => {
  if (!this.visitDetails.createPackLater) {
    this.drugsDuration = duration;
    this.nextPUpDate = nextPDate;
    this.pickupDate = new Date(pickupDate);
  }
  const prescriptionCopy = new Prescription(
    JSON.parse(JSON.stringify(this.prescription))
  );
  prescriptionCopy.patientVisitDetails = PatientVisitDetails.query()
    .with('pack')
    .where('prescription_id', prescriptionCopy.id)
    .get();
  if (duration.weeks > prescriptionCopy.remainigDurationInWeeks()) {
    this.displayAlert(
      'error',
      'O Período para o qual pretende efectuar a dispensa é maior que o período remanescente nesta prescrição [' +
        Number(prescriptionCopy.remainigDurationInWeeks() / 4) +
        ' mes(es)]'
    );
  } else {
    this.showAddEditDrug = true;
  }
};
const deleteRow = (row) => {
  const i = this.prescribedDrugs.map((toRemove) => toRemove.id).indexOf(row.id); // find index of your object
  this.prescribedDrugs.splice(i, 1);
  this.$emit(
    'updatePrescribedDrugs',
    this.prescribedDrugs,
    this.pickupDate,
    this.nextPUpDate,
    this.drugsDuration
  );
};
const addPrescribedDrug = (prescribedDrug) => {
  const prescribedDrugExists = this.prescribedDrugs.some((item) => {
    return item.drug.id === prescribedDrug.drug.id;
  });
  if (!prescribedDrugExists) {
    const hasStock = this.checkStock(prescribedDrug);
    if (hasStock) {
      if (
        new PrescribedDrug(prescribedDrug).getQtyPrescribed(this.duration) <= 0
      ) {
        this.displayAlert(
          'error',
          'Quantidade de Medicamento superior ao solicitado! \n O frasco seleccionado possui quantidade de medicamento superior ao necessário para cobrir o período de dispensa indicado.'
        );
      } else {
        this.showAddEditDrug = false;
        if (!this.visitDetails.createPackLater)
          prescribedDrug.nextPickUpDate = this.nextPUpDate;
        this.prescribedDrugs.push(new PrescribedDrug(prescribedDrug));
        this.$emit(
          'updatePrescribedDrugs',
          this.prescribedDrugs,
          this.pickupDate,
          this.nextPUpDate,
          this.drugsDuration
        );
      }
    } else {
      this.displayAlert(
        'error',
        'O medicamento seleccionado não possui stock suficiente para dispensar.'
      );
    }
  } else {
    this.displayAlert(
      'error',
      'Não pode adicionar o medicamento seleccionado, pois ja existe na lista dos medicamentos prescritos.'
    );
  }
};
const checkStock = (prescribedDrug) => {
  let qtyInStock = 0;
  const qtyPrescribed = prescribedDrug.getQtyPrescribed(this.drugsDuration);
  const stocks = Stock.query().where('drug_id', prescribedDrug.drug.id).get();
  const validStock = stocks.filter((item) => {
    return new Date(item.expireDate) > new Date();
  });
  if (validStock.length <= 0) {
    return false;
  } else {
    validStock.forEach((item) => {
      qtyInStock = Number(qtyInStock + item.stockMoviment);
    });
    if (qtyInStock < qtyPrescribed) {
      return false;
    } else {
      return true;
    }
  }
};
const init = () => {
  console.log(this.step);
  this.pickupDate = this.newPickUpDate;
  if (this.isNewPrescriptionStep) {
    const pvd = new PatientVisitDetails(this.visitClone);
    this.prescribedDrugs = pvd.prescription.prescribedDrugs;
  } else if (
    this.oldPrescribedDrugs !== null &&
    this.oldPrescribedDrugs.length > 0
  ) {
    this.prescribedDrugs = this.oldPrescribedDrugs;
    console.log('prescribedD: ', this.prescribedDrugs);
    this.$emit('updatePrescribedDrugs', this.prescribedDrugs);
  }
};
const updateQtyPrescribed = (duration, pickupDate, nextPDate) => {
  this.drugsDuration = duration;
  this.nextPUpDate = nextPDate;
  this.pickupDate = pickupDate;
  this.$emit(
    'updatePrescribedDrugs',
    this.prescribedDrugs,
    pickupDate,
    nextPDate,
    duration
  );
};
const loadParams = async () => {
  if (this.mobile) {
    await Drug.localDbGetAll().then((drugs) => {
      drugs.forEach((drug) => {
        drug.clinicalServiceId = '';
        drug.formId = '';
        Drug.insert({ data: drug });
      });
    });
  }
};
// Hooks
onMounted(() => {
  init();
  this.setStep(this.stepp);
  this.curVisitDetails = Object.assign({}, this.visitDetails);
  this.currPrescription = new Prescription(this.prescription);
  this.loadParams();
});
// Computed
const duration = computed(() => {
  if (this.isEditPackStep) {
    return Duration.query().where('weeks', this.lastPack.weeksSupply).first();
  } else {
    return Duration.query()
      .where(
        'weeks',
        this.currPrescription.prescriptionDetails[0].dispenseType.getRelatedWeeks()
      )
      .first();
  }
});
const newPickUpDate = computed(() => {
  if (this.isNewPrescriptionStep || this.lastPack === null) {
    return this.currPrescription.prescriptionDate;
  } else if (this.isAlreadyEdited) {
    return this.curVisitDetails.pack.pickupDate;
  } else if (this.isEditPackStep) {
    return this.lastPack.pickupDate;
  } else {
    return this.lastPack.nextPickUpDate;
  }
});
const isEditPackStep = computed(() => {
  return this.step === 'editPack';
});
const isNewPackStep = computed(() => {
  return this.step === 'addNewPack';
});
const isNewPrescriptionStep = computed(() => {
  return this.currPrescription.id === null;
});
</script>

<style></style>
