/**
 * Sahana Eden Mobile - Files Service
 *
 * Copyright (c) 2016-2017: Sahana Software Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

"use strict";

(function() {

    // ========================================================================
    /**
     * Decorator returning an error handler function for file
     * plugin errors
     *
     * @param {string} message - the error message
     * @param {function} callback - optional error callback, function(error)
     *
     * @returns {function} - the error handler
     */
    var fsError = function(message, callback) {
        return function(error) {
            alert('Error ' + error.code + ': ' + (message || 'unknown error'));
            if (!!callback) {
                callback(error);
            }
        };
    };

    // ------------------------------------------------------------------------
    /**
     * Get upload directory
     *
     * @param {function} onSuccess - the success callback, receives the
     *                               upload directory entry as parameter
     */
    var getUploadDirectory = function(onSuccess) {

        var dataDirectory = cordova.file.externalDataDirectory ||
                            cordova.file.dataDirectory,
            uploadDirectory = 'uploads';

        window.resolveLocalFileSystemURL(dataDirectory, function(dataDir) {
            dataDir.getDirectory(uploadDirectory,
                {
                    create: true
                },
                onSuccess,
                fsError('unable to access upload directory'));
        });
    };

    // ------------------------------------------------------------------------
    /**
     * Helper function to move a file to a persistent location
     *
     * @param {object} fileEntry - the file entry
     * @param {function} callback - the callback function, receives
     *                              the new file URI as parameter
     * @param {string} resourceName - name of the resource the file is linked to
     * @param {string} fieldName - name of the field the file is linked to
     */
    var moveFile = function(fileEntry, onSuccess, resourceName, fieldName) {

        var fileName = fileEntry.name;

        // Resolve targetDir, then move the file
        getUploadDirectory(function(uploadDir) {

            // Generate new file name
            var newFileName = fileName;
            if (!!resourceName && !!fieldName) {
                newFileName = [resourceName, fieldName, fileName].join('.');
            }

            fileEntry.moveTo(uploadDir, newFileName, function(newFileEntry) {
                if (onSuccess) {
                    onSuccess(newFileEntry.nativeURL);
                }
            }, fsError('failed to move file'));
        });
    };

    // ------------------------------------------------------------------------
    /**
     * API function to store a file for an upload-field
     *
     * @param {string} fileURI - the file URI
     * @param {function} callback - the callback function, receives
     *                              the new file URI as parameter
     * @param {string} resourceName - name of the resource the file is linked to
     * @param {string} fieldName - name of the field the file is linked to
     */
    var store = function(fileURI, callback, resourceName, fieldName) {

        window.resolveLocalFileSystemURL(fileURI, function(fileEntry) {
            moveFile(fileEntry, callback, resourceName, fieldName);
        }, fsError('file not found'));
    };

    // ------------------------------------------------------------------------
    /**
     * API function to remove a file
     *
     * @param {string} fileURI - the file URI
     * @param {function} callback - the callback function, receives
     *                              no arguments
     */
    var remove = function(fileURI, callback) {

        window.resolveLocalFileSystemURL(fileURI, function(fileEntry) {
            fileEntry.remove(function() {
                if (callback) {
                    callback();
                }
            }, fsError('error deleting the file'));
        }, fsError('file not found'));
    };

    // ------------------------------------------------------------------------
    /**
     * API function to remove multiple files
     *
     * @param {Array} files - array of file URIs
     */
    var removeAll = function(files) {

        files.forEach(function(fileURI) {
            window.resolveLocalFileSystemURL(fileURI, function(fileEntry) {
                fileEntry.remove();
            });
        });
    };

    // ------------------------------------------------------------------------
    /**
     * API function to retrieve a file
     *
     * @param {string} fileURI - the file URI
     * @param {function} onSuccess - success callback, function(fileName, file)
     * @param {function} onError - error callback, function(error)
     */
    var getFile = function(fileURI, onSuccess, onError) {

        window.resolveLocalFileSystemURL(fileURI, function(fileEntry) {

            var fileName = fileEntry.name;
            fileEntry.file(function(file) {
                onSuccess(fileName, file);
            }, fsError('unable to read file', onError));
        }, fsError('file not found', onError));
    };

    // ------------------------------------------------------------------------
    /**
     * API function to retrieve a file as BLOB
     * (uses MIME-type "application/octet-stream")
     *
     * @param {string} fileURI - the file URI
     * @param {function} onSuccess - success callback, function(fileName, blob)
     * @param {function} onError - error callback, function(error)
     */
    var getBlob = function(fileURI, onSuccess, onError) {

        getFile(fileURI, function(fileName, file) {

            var reader = new FileReader();
            reader.onloadend = function(e) {
                var blob = new Blob([this.result], {type: "application/octet-stream"});
                onSuccess(fileName, blob);
            };
            reader.readAsArrayBuffer(file);
        }, onError);
    };

    // ========================================================================
    /**
     * emFiles - Service to handle files for upload-fields
     *
     * @class emFiles
     * @memberof EdenMobile
     */
    EdenMobile.factory('emFiles', [
        function () {

            var api = {

                store: store,
                remove: remove,
                removeAll: removeAll,

                getFile: getFile,
                getBlob: getBlob
            };
            return api;
        }
    ]);

})();

// END ========================================================================
