///<reference path="../../../headers/common.d.ts" />

import angular from 'angular';
import _ from 'lodash';
import moment from 'moment';

import * as dateMath from 'app/core/utils/datemath';

function PrometheusQueryCtrl($scope, templateSrv) {
  $scope.panelCtrl = $scope.ctrl;
  $scope.panel = $scope.panelCtrl.panel;

  $scope.init = function() {
    var target = $scope.target;

    target.expr = target.expr || '';
    target.intervalFactor = target.intervalFactor || 2;

    $scope.metric = '';
    $scope.resolutions = _.map([1,2,3,4,5,10], function(f) {
      return {factor: f, label: '1/' + f};
    });

    $scope.$on('typeahead-updated', function() {
      $scope.$apply($scope.inputMetric);
      $scope.refreshMetricData();
    });
  };

  $scope.refreshMetricData = function() {
    if (!_.isEqual($scope.oldTarget, $scope.target)) {
      $scope.oldTarget = angular.copy($scope.target);
      $scope.paneCtrl.refresh();
    }
  };

  $scope.inputMetric = function() {
    $scope.target.expr += $scope.target.metric;
    $scope.metric = '';
  };

  $scope.suggestMetrics = function(query, callback) {
    $scope.datasource
    .performSuggestQuery(query)
    .then(callback);
  };

  $scope.linkToPrometheus = function() {
    var range = Math.ceil(($scope.range.to.valueOf() - $scope.range.from.valueOf()) / 1000);
    var endTime = $scope.range.to.utc().format('YYYY-MM-DD HH:mm');
    var expr = {
      expr: templateSrv.replace($scope.target.expr, $scope.panel.scopedVars),
      range_input: range + 's',
      end_input: endTime,
      step_input: '',
      stacked: $scope.panel.stack,
      tab: 0
    };
    var hash = encodeURIComponent(JSON.stringify([expr]));
    return $scope.datasource.directUrl + '/graph#' + hash;
  };

  $scope.init();
}

export {PrometheusQueryCtrl};
