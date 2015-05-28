mongolar.config(function(formlyConfigProvider) {
    formlyConfigProvider.setType({
      name: 'repeatSection',
      templateUrl: 'assets/templates/repeatSection.html',
      controller: function($scope) {
        $scope.formOptions = {
          formState: $scope.formState
        };
        $scope.addNew = function() {
          $scope.model[$scope.options.key] = $scope.model[$scope.options.key] || [];
          var repeatsection = $scope.model[$scope.options.key];
          var lastSection = repeatsection[repeatsection.length - 1];
          var newsection = {};
          if (lastSection) {
            newsection = angular.copy(lastSection);
          }

          repeatsection.push(newsection);
        };
      }
  });
})
