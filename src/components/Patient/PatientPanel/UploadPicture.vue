<template>
  <div>
    <!-- Button to open camera dialog -->
    <q-btn
      color="primary"
      @click="startCamera"
      :disable="props.disable"
      icon="photo_camera"
    />
    <q-tooltip v-if="props.disable"
      >Remova o ficheiro anexado , para poder tirar foto</q-tooltip
    >

    <!-- Camera Dialog -->
    <q-dialog v-model="cameraDialog">
      <q-card>
        <div class="q-pt-sm q-pr-sm" align="right">
          <q-btn
            round
            color="negative"
            icon="close"
            @click="closeCameraDialog"
          />
        </div>
        <q-card-section>
          <!-- Camera component with smaller size -->
          <div class="camera-small" v-if="cameraActive && !capturedImage">
            <video
              ref="videoElement"
              autoplay
              playsinline
              class="camera-video"
            ></video>
          </div>
          <div v-if="!cameraActive && capturedImage">
            <img :src="capturedImage" class="camera-small" />
          </div>
        </q-card-section>

        <q-card-actions align="center">
          <div v-if="cameraActive && !capturedImage">
            <q-btn
              round
              color="primary"
              icon="photo_camera"
              @click="captureImage"
            />
          </div>

          <div v-if="!cameraActive && capturedImage" class="camera-start">
            <div class="preview-actions q-mt-md q-gutter-x-md row">
              <q-btn
                color="negative"
                icon-right="delete"
                label="Descartar"
                @click="discardImage"
              />
              <q-btn
                color="positive"
                icon-right="cloud_upload"
                label="Guardar"
                @click="uploadImage"
              />
            </div>
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Display captured image (optional) -->
    <div v-if="imageUrl" class="q-mt-md">
      <img :src="imageUrl" alt="Captured image" style="max-width: 300px" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, provide, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { useSystemUtils } from '../../../composables/shared/systemUtils/systemUtils';

const { isMobile } = useSystemUtils();
const $q = useQuasar();
const cameraActive = ref(false);
const capturedImage = ref(null);
const stream = ref(null);
const hasCamera = ref(false);
const videoElement = ref(null);
const isStreamActive = ref(false);
const curPrescription = inject('curPrescription');
const mediaConstraints = {
  video: {
    facingMode: 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: false, // Explicitly disable audio if you don't need it
};
// Refs
const cameraDialog = ref(false);
const image = ref(null);
const prescription = ref({ photo: null });

const props = defineProps(
  ['disable'] // Add this line
);

const emit = defineEmits(['image-captured']);
// Computed property to create image URL
const imageUrl = computed(() => {
  if (!image.value) return null;
  return image.value;
});

// Functions
const openCameraDialog = () => {
  cameraDialog.value = true;
};

const discardImage = async () => {
  capturedImage.value = null;
  startCamera();
  // Make sure camera is still running
};

const captureImage = () => {
  if (!videoElement.value) return;

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.value.videoWidth;
  canvas.height = videoElement.value.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);

  capturedImage.value = canvas.toDataURL('image/jpeg');
  stopCamera();
};

const startCamera = async () => {
  // cameraDialog.value = true;

  if (isMobile.value) {
    const options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      cameraDirection: Camera.Direction.BACK,
      correctOrientation: true,
    };

    navigator.camera.getPicture(
      (imageData) => {
        // Success callback
        capturedImage.value = imageData;
        uploadImage();
        // const image = 'data:image/jpeg;base64,' + imageData;
        // Handle the image (store it in a ref or do whatever you need)
        cameraActive.value = false;
        cameraDialog.value = false;
      },
      (error) => {
        // Error callback
        console.error('Error capturing photo:', error);
        cameraActive.value = false;

        $q.notify({
          type: 'negative',
          message: 'Failed to capture photo: ' + error,
        });
      },
      options
    );
  } else {
    cameraDialog.value = true;
    capturedImage.value = null;
    try {
      if (stream.value) {
        stopCamera();
      }
      cameraActive.value = true;

      // wait for the DOM to update if using v-if:
      await nextTick();

      stream.value = await navigator.mediaDevices.getUserMedia(
        mediaConstraints
      );

      if (videoElement.value) {
        videoElement.value.srcObject = stream.value;

        videoElement.value.onloadedmetadata = () => {
          videoElement.value
            .play()
            .then(() => {
              isStreamActive.value = true;
            })
            .catch((err) => {
              console.error('Error playing video:', err);
            });
        };
      } else {
        console.error('Video element reference is null');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      $q.notify({
        type: 'negative',
        message: 'Failed to access camera. Please check permissions.',
      });
    }
  }
};

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
    if (videoElement.value) {
      videoElement.value.srcObject = null;
    }
    stream.value = null;
    isStreamActive.value = false;
  }
  cameraActive.value = false;
  // cameraDialog.value = false;
};

const closeCameraDialog = () => {
  if (stream.value) {
    //  stream.value.getTracks().forEach((track) => track.stop());
    /*
    if (videoElement.value) {
      videoElement.value.srcObject = null;
    }

    stream.value = null;
    isStreamActive.value = false;
    */
  }
  cameraActive.value = false;
  cameraDialog.value = false;
};

/*
const saveImage = () => {
  // Here you can process the image before saving
  // For example, convert to byte array for backend
  // First, remove the data:image/jpeg;base64, prefix
  /*
  const base64String = image.value.split(',')[1];

  // Convert base64 to byte array using the fetch API
  fetch(`data:image/jpeg;base64,${base64String}`)
    .then((res) => res.arrayBuffer())
    .then((buffer) => {
      // Get the byte array
      const bytes = new Uint8Array(buffer);

      // Update your prescription object with the bytes
      prescription.value.photo = Array.from(bytes);

      // You can now send this to your backend

      // Close the dialog
      cameraDialog.value = false;
    });
};
 */

const uploadImage = async () => {
  if (!capturedImage.value) return;
  const imageBase64 = capturedImage.value.split(',')[1];

  emit('image-captured', imageBase64);
  closeCameraDialog();
};
</script>

<style>
.camera-small {
  justify-content: center; /* horizontal */
  align-items: center; /* vertical */
  height: 30vh;
  width: 100%; /* or a specific value */
}
.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover; /* makes sure the video fills without distortion */
}
</style>
