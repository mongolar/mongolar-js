mongolar.controller('MenuEditor', function ContentController($scope) {
    $scope.AddNewChild = function(target) {
        item = {
		'title': '', 
		'url': '', 
		'menu_items': []
	} 
    	target.push(item);
    }
    $scope.Delete = function(index) {
    	$scope.$parent.$parent.$parent.parentmenu.splice(index, 1);
    }
    $scope.Log = function(target) {
    	console.log(target);
    }
  }
)


