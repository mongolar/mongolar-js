
mongolar.config(["$httpProvider", function ($httpProvider) {
    $httpProvider.interceptors.push('messageCatcher');
    $httpProvider.interceptors.push('reloadCatcher');
    $httpProvider.interceptors.push('redirectCatcher');
    $httpProvider.interceptors.push('queryCatcher');
    $httpProvider.interceptors.push('dynamicCatcher');
}]);
mongolar.run(function($http) {
    $http.defaults.headers.common.CurrentPath = window.location.pathname;
});

mongolar.controller('ContentController', function ContentController($scope, mongolarService) {
    mongolarService.mongolarHttp($scope).then(function(response) {
        if(typeof response.data =='object') {
            angular.extend($scope, response.data);
        }
    });
    $scope.onSubmit = function() {
        var form_data = {};
        console.log($scope);
        $scope.mongolar_content.formFields.forEach(function(field){
            form_data[field.key] = $scope.mongolar_content.formData[field.key];
        });
        form_data.form_id = $scope.mongolar_content.formOptions.uniqueFormId;
        mongolarService.mongolarPost(form_data).then(function(response) {
            if(typeof response.data =='object') {
                angular.extend($scope, response.data);
            }
        });
    }
    $scope.dynLoad = function(){
        mongolarService.mongolarHttp($scope).then(function(response) {
            if(typeof response.data =='object') {
                angular.extend($scope, response.data);
            }
        });
    }
    $scope.scopeSend =  function($path, $value) {
        mongolarService.mongolarScopeSend($path, $value);
    }
    $scope.serverSend = mongolarService.mongolarServerSend;
});
mongolar.factory('mongolarService', function($http, growl, mongolarConfig) {
    var mongolarService = {
        mongolarHttp: function($arguments) {
            var argument = $arguments.mongolartype;
            if($arguments.mongolarid != undefined){
                argument = argument + '/' + $arguments.mongolarid;
            }
	    console.log($arguments)
            var promise = $http.get(mongolarConfig.mongolar_url + argument).success(function(response){
                return response;
            });
            return promise;
        },
        mongolarPost: function($arguments) {
            var promise = $http.post(mongolarConfig.mongolar_url + "form", $arguments).success(function(response){
                return response;
            });
            return promise;
        },
        mongolarServerSend: function($path) {
            var promise = $http.get(mongolarConfig.mongolar_url  + $path).success(function(response){
                return response;
            });
            return promise;
        },
        mongolarScopeSend: function($path, $values) {
            var promise = $http.post(mongolarConfig.mongolar_url  + $path, $values).success(function(response){
                return response;
            });
            return promise;
        }
    };
    return mongolarService;
});

mongolar.factory('queryCatcher', function($injector) {
    var queryCatcher = {
        response: function(response) {
            if(typeof response.data.mongolar_content =='object') {
                if('query_parameters' in response.data.mongolar_content){
                    var http = $injector.get('$http');
                    http.defaults.headers.common.QueryParameters = response.data.mongolar_content.query_parameters;
                }
            }
            return response;
        }
    }
    return queryCatcher;
});

mongolar.factory('messageCatcher', function(growl) {
    var messageCatcher = {
        response: function(response) {
            if(typeof response.data =='object') {
                if('mongolar_messages' in response.data) {
                    response.data.mongolar_messages.forEach(function (message) {
                        var growlcall = 'add' + message.severity + 'Message';
                        growl[growlcall](message.text);
                    });
                }
            }
            return response;
        }
    }
    return messageCatcher;
});

mongolar.factory('reloadCatcher', function() {
    var reloadCatcher = {
        response: function(response) {
            if(typeof response.data =='object') {
                if('mongolar_reload' in response.data){
                    location.reload();
                }
            }
            return response;
        }
    }
    return reloadCatcher;
});

mongolar.factory('redirectCatcher', function() {
    var reloadCatcher = {
        response: function(response) {
            if(typeof response.data =='object') {
                if('mongolar_redirect' in response.data){
                    window.location.replace(response.data.mongolar_redirect);
                }
            }
            return response;
        }
    }
    return reloadCatcher;
});

mongolar.factory('dynamicCatcher', function($rootScope) {
    var dynamicCatcher = {
        response: function(response) {
            if(typeof response.data =='object') {
                if('mongolar_dynamics' in response.data){
                    response.data.mongolar_dynamics.forEach(function (dynamic) {
                        $rootScope.$broadcast(dynamic.target, {
                            dyn_control: dynamic.controller,
                            dyn_template: dynamic.template,
                            dyn_id: dynamic.id,
                        });
                    });
                }
            }
            return response;
        }
    }
    return dynamicCatcher;
});

mongolar.directive('mongolar', function mongolar($http, $compile, $rootScope, mongolarConfig){
  return {
    controller: 'ContentController',
    transclude: true,
    scope: {
      'mongolarid' : '@',
      'mongolartemplate' : '@',
      'mongolartype' : '@',
      'mongolardyn' : '@'
    },
    template: '<div ng-include = "getTemplate()" ng-hide="hide"></div>',
      link : function(scope)
      {
          scope.getTemplate = function(){
              return mongolarConfig.templates_url + scope.mongolartemplate;
          }
          if (scope.mongolardyn != undefined){
              scope.$on(
                  scope.mongolardyn, function (event, data) {
                      scope.mongolartype = data.dyn_control;
                      scope.mongolar = data.dyn_id;
                      scope.mongolartemplate = data.dyn_template;
                      scope.dynLoad();
                  }
              );
          }
          scope.dynamicLoad = function(mongolar_id, controller, template, target) {
              $rootScope.$broadcast(target, {
                  dyn_control : controller,
                  dyn_template : template,
                  dyn_id : mongolar_id
              });
          }
      }
  }
});

