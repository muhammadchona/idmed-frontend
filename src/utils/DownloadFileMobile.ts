import moment from 'moment';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileViewer } from '@capacitor/file-viewer';

const stopLoading = (loading: any) => {
  if (loading && typeof loading === 'object' && 'value' in loading) {
    loading.value = false;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = String(reader.result ?? '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.readAsDataURL(blob);
  });

const bytesToBase64 = (bytes: Uint8Array) => {
  const chunkSize = 0x8000;
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + chunkSize)
    );
  }
  return btoa(binary);
};

const toBase64 = async (data: any): Promise<string> => {
  if (data instanceof Blob) return blobToBase64(data);
  if (data instanceof ArrayBuffer) return bytesToBase64(new Uint8Array(data));
  if (ArrayBuffer.isView(data)) {
    return bytesToBase64(
      new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
    );
  }
  if (typeof data === 'string') {
    if (data.startsWith('data:')) return data.split(',')[1] ?? '';
    return btoa(data);
  }
  throw new TypeError('Unsupported report file data');
};

export default {
  async downloadFile(
    fileName: string,
    fileType: string,
    fileData: any,
    loading?: any
  ) {
    const titleFile =
      fileName + moment(new Date()).format('DD-MM-YYYY_HHmmss') + fileType;

    try {
      const data = await toBase64(fileData);
      let savedFile;
      try {
        savedFile = await Filesystem.writeFile({
          path: titleFile,
          data,
          directory: Directory.Documents,
          recursive: true,
        });
      } catch (documentsError) {
        console.warn(
          'Unable to save the report in Documents; using app cache',
          documentsError
        );
        savedFile = await Filesystem.writeFile({
          path: titleFile,
          data,
          directory: Directory.Cache,
          recursive: true,
        });
      }

      await FileViewer.openDocumentFromLocalPath({ path: savedFile.uri });
      return savedFile.uri;
    } catch (error) {
      console.error('Unable to save or open the mobile report', error);
      throw error;
    } finally {
      stopLoading(loading);
    }
  },
};
