/**
 * Sahana Eden Mobile - List and Card Directives
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

// ============================================================================
/**
 * emDataCard - directive for cards in data list
 *
 * @class emDataCard
 * @memberof EdenMobile
 */
EdenMobile.directive("emDataCard", [
    '$compile', 'emResources',
    function($compile, emResources) {

        var renderCard = function($scope, elem, attr) {

            // => Scope structures used (provided by controller):
            // $scope.resourceName: the master resource name
            // $scope.recordID: the master record ID
            // $scope.componentName: the component resource name
            // $scope.record: the target record, {fieldName: value}
            // $scope.cardConfig: the card config for the target record

            // Link target
            var target;
            if (!!$scope.componentName) {
                // Link to componentUpdate
                target = 'data.componentUpdate({' +
                         'resourceName:&quot;{{resourceName}}&quot;,' +
                         'recordID:{{recordID}},' +
                         'componentName:&quot;{{componentName}}&quot;,' +
                         'componentID:{{record.id}}})';
            } else {
                // Link to update
                target = 'data.update({' +
                         'resourceName:&quot;{{resourceName}}&quot;,' +
                         'recordID:{{record.id}}})';
            }

            // Read the card config
            var cardConfig = $scope.cardConfig,
                titleTemplate,
                cardTemplate;
            if (cardConfig) {
                titleTemplate = cardConfig.title;
            }
            if (!titleTemplate) {
                // Fallback
                titleTemplate = 'Record #{{record.id}}';
            }

            // Construct the data card template
            cardTemplate = '<a class="item item-text-wrap" ' +
                           'ui-sref="' + target + '">' +
                           titleTemplate + '</a>';

            // Compile the data card template against the scope,
            // then render it in place of the directive
            var compiled = $compile(cardTemplate)($scope);
            elem.replaceWith(compiled);
        };

        return {
            link: renderCard
        };
    }
]);

// ============================================================================
/**
 * emResource - directive for cards in resource list
 *
 * @class emResource
 * @memberof EdenMobile
 */
EdenMobile.directive('emResource', [
    '$compile', 'emResources',
    function($compile, emResources) {

        var renderCard = function($scope, elem, attr) {

            var resourceData = $scope.resource,
                resourceName = resourceData.name,
                numRows = resourceData.numRows;

            emResources.open(resourceName).then(function(resource) {

                var strings = resource.strings,
                    cardLabel = resource.name,
                    cardIcon = 'ion-folder';

                if (strings) {
                    cardLabel = strings.namePlural || strings.name || cardLabel;
                    cardIcon = strings.icon || cardIcon;
                }

                // Construct the data card template
                var cardTemplate = '<a class="item item-icon-left" href="#/data/' + resourceName + '">' +
                                   '<i class="icon ' + cardIcon + '"></i>' +
                                   cardLabel +
                                   '<span class="badge badge-assertive">' + numRows + '</span>' +
                                   '</a>';

                // Compile the data card template against the scope,
                // then render it in place of the directive
                var compiled = $compile(cardTemplate)($scope);
                elem.replaceWith(compiled);
            });
        };

        return {
            link: renderCard
        };
    }
]);

// ============================================================================
/**
 * emSyncFormCard - directive for cards in sync form selection
 *
 * @class emSyncFormCard
 * @memberof EdenMobile
 */
EdenMobile.directive("emSyncFormCard", [
    '$compile',
    function($compile) {

        var renderCard = function($scope, elem, attr) {

            var form = $scope.form,
                label = form.label;

            // @todo: clean this up (readability)
            var ngClass="{'inactive': !form.download," +
                        "'balanced': form.download," +
                        "'ion-android-checkbox-outline': form.installed && !form.download || !form.installed && form.download," +
                        "'ion-android-sync': form.installed && form.download," +
                        "'ion-android-checkbox-outline-blank': !form.installed && !form.download, " +
                        "'icon': true}";

            var cardTemplate = '<a class="item item-icon-right" ng-click="form.download=!form.download; countSelected();">' +
                               '<i ng-class="' + ngClass + '"></i>' +
                               '<h2>' + label + '</h2>' +
                               '<p><small>' + form.resourceName + '</small></p>' +
                               '</a>';

            var compiled = $compile(cardTemplate)($scope);
            elem.replaceWith(compiled);
        };

        return {
            link: renderCard
        };
    }
]);

// ============================================================================
/**
 * emSyncResourceCard - directive for cards in sync resource selection
 *
 * @class emSyncResourceCard
 * @memberof EdenMobile
 */
EdenMobile.directive("emSyncResourceCard", [
    '$compile',
    function($compile) {

        var renderCard = function($scope, elem, attr) {

            var resource = $scope.resource,
                label = resource.label;

            // @todo: clean this up (readability)
            var ngClass="{'inactive': !resource.upload," +
                        "'balanced': resource.upload," +
                        "'ion-android-checkbox-outline': resource.upload," +
                        "'ion-android-checkbox-outline-blank': !resource.upload, " +
                        "'icon': true}";

            var cardTemplate = '<a class="item item-icon-right" ng-click="resource.upload=!resource.upload; countSelected();">' +
                               '<i ng-class="' + ngClass + '"></i>' +
                               '<h2>' + label + '</h2>' +
                               '<p><small>' + resource.updated + ' new/updated records</small></p>' +
                               '</a>';

            var compiled = $compile(cardTemplate)($scope);
            elem.replaceWith(compiled);
        };

        return {
            link: renderCard
        };
    }
]);

// ============================================================================
/**
 * emSyncLogCard - directive for cards in sync log data view
 *
 * @class emSyncLogCard
 * @memberof EdenMobile
 */
EdenMobile.directive("emSyncLogCard", [
    '$compile',
    function($compile) {

        var renderCard = function($scope, elem, attr) {

            var entry = $scope.entry,
                cardTemplate = angular.element('<div class="item">'),
                headers = [],
                footers = [];

            var timestamp = entry.timestamp;
            if (timestamp) {
                headers.push(timestamp.toLocaleString());
            }
            var jobStr = [];
            switch(entry.mode) {
                case 'pull':
                    jobStr.push('Download');
                    break;
                case 'push':
                    jobStr.push('Upload');
                    break;
                default:
                    break;
            }
            switch(entry.type) {
                case 'data':
                    jobStr.push('Data');
                    break;
                case 'form':
                    jobStr.push('Form');
                    break;
                default:
                    break;
            }
            if (jobStr.length) {
                headers.push(jobStr.join('/'));
            }

            if (headers.length) {
                var header = angular.element('<p><small>' + headers.join(' - ') + '</small></p>');
                cardTemplate.append(header);
            }

            if (entry.resource) {
                var resource = angular.element('<h2>' + entry.resource + '</h2>');
                cardTemplate.append(resource);
            }

            var result,
                resultClass;
            switch(entry.result) {
                case 'success':
                    result = 'Success';
                    resultClass = 'sync-result success';
                    break;
                case 'error':
                    result = 'Error';
                    resultClass = 'sync-result error';
                    break;
                default:
                    result = entry.result;
                    resultClass = 'sync-result';
                    break;
            }
            if (result) {
                footers.push(result);
            }
            if (entry.message) {
                footers.push(entry.message);
            }
            if (footers.length) {
                var footer = angular.element('<p class="' + resultClass + '">' + footers.join(': ') + '</p>');
                cardTemplate.append(footer);
            }

            var compiled = $compile(cardTemplate)($scope);
            elem.replaceWith(compiled);
        };

        return {
            link: renderCard
        };
    }
]);

// END ========================================================================
