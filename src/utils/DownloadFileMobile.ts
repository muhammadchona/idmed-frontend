export default {
  downloadFile(fileName, fileType, blop) {
    // console.log(blop)
    // var pdfOutput = blop.output()
    //  console.log(pdfOutput)
    //  if (typeof cordova !== 'undefined') {
    //   var blob = new Blob(materialEducativo.blop)
    //  const bytes = new Uint8Array(materialEducativo.blop)
    // var UTF8_STR = new Uint8Array(pdfOutput)
    //   var BINARY_ARR = UTF8_STR.buffer
    const titleFile = fileName + fileType;
    console.log('result' + titleFile);
    saveBlob2File(titleFile, blop);
    function saveBlob2File(fileName, blob) {
      const folder = cordova.file.externalRootDirectory + 'Download';
      //  var folder = 'Download'
      window.resolveLocalFileSystemURL(
        folder,
        function (dirEntry) {
          createFile(dirEntry, fileName, blob);
          // $q.loading.hide()
        },
        onErrorLoadFs
      );
    }
    function createFile(dirEntry, fileName, blob) {
      // Creates a new file
      dirEntry.getFile(
        fileName,
        { create: true, exclusive: false },
        function (fileEntry) {
          writeFile(fileEntry, blob);
        },
        onErrorCreateFile
      );
    }

    function writeFile(fileEntry, dataObj) {
      // Create a FileWriter object for our FileEntry
      fileEntry.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function () {
          console.log('Successful file write...');
          openFile();
        };

        fileWriter.onerror = function (error) {
          console.log('Failed file write: ' + error);
        };
        fileWriter.write(dataObj);
      });
    }
    function onErrorLoadFs(error) {
      console.log(error);
    }

    function onErrorCreateFile(error) {
      console.log('errorr: ' + error.toString());
    }
    function openFile() {
      const strTitle = titleFile;
      console.log('file system 44444: ' + strTitle);
      const folder =
        cordova.file.externalRootDirectory + 'Download/' + strTitle;
      console.log('file system 2222: ' + folder);
      const documentURL = decodeURIComponent(folder);
      cordova.plugins.fileOpener2.open(documentURL, 'application/pdf', {
        error: function (e) {
          console.log('file system open3333366: ' + e + documentURL);
        },
        success: function () {},
      });
    }
    // }
  },
};
