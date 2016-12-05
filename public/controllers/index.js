const app = require('../index').app;

app
  .controller('MainController', ['$scope', '$mdSidenav', '$state', ($scope, $mdSidenav, $state) => {
    $scope.historyIndex = false;
    $scope.setHistoryIndex = (index) => {
      $scope.historyIndex = index;
    };
    $scope.index = 0;
    $scope.setIndex = (index) => {
      $scope.index = index;
    };
    $scope.images = [];
    $scope.openMenu = () => {
      $mdSidenav('left').toggle();
      // if($state.current.name === 'history') {
      //   $state.go('index');
      // }
      // if($state.current.name === 'index') {
      //   $state.go('history');
      // }
    };
    $scope.menus = [
      {name: '首页', icon: 'home', click: 'index' },
      {name: '浏览记录', icon: 'history', click: 'history' },
    ];
    $scope.menuClick = index => {
      $state.go($scope.menus[index].click);
      $mdSidenav('left').close();
    };
  }])
  .controller('IndexController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$localStorage',
    ($scope, $http, $state, $stateParams, $timeout, $localStorage) => {
      $localStorage.$default({
        history: []
      });
      $scope.getImages = () => {
        if($scope.images.length > 10) {
          return;
        }
        $http.get('/random').then(success => {
          if($scope.images.indexOf(success.data) > 0) {
            return $scope.getImages();
          }
          if(!$scope.images.length) {
            $localStorage.history.push(success.data);
            $scope.setIndex(0);
          }
          $scope.images.push(success.data);
          $scope.getImages();
        }).catch(() => {
          $scope.getImages();
        });
      };
      if($scope.historyIndex) {
        $scope.images[0] = $localStorage.history[$scope.index];
        $scope.setHistoryIndex(false);
      }
      $scope.getImages();
      $scope.random = () => {
        $scope.images.splice(0, 1);
        $localStorage.history.push($scope.images[0]);
        if($localStorage.history.length > 60) {
          $localStorage.history.splice(0, $localStorage.history.length - 60);
        }
        $scope.setIndex($localStorage.history.length - 1);
        $scope.getImages();
      };
      $scope.next = () => {
        if($scope.index < $localStorage.history.length - 1) {
          $scope.setIndex($scope.index + 1);
          $scope.images[0] = $localStorage.history[$scope.index];
        } else {
          $scope.random();
        }
      };
      $scope.prev = () => {
        if($scope.index > 0) {
          $scope.setIndex($scope.index - 1);
          $scope.images[0] = $localStorage.history[$scope.index];
        }
      };
    }
  ])
  .controller('HistoryController', ['$scope', '$localStorage', '$state', '$mdMedia',
    ($scope, $localStorage, $state, $mdMedia) => {
      $scope.divHeightStyle = { height: 100/3 + 'vw' };
      if($mdMedia('md')) {
        $scope.divHeightStyle.height = 100/4 + 'vw';
      }
      if($mdMedia('gt-md')) {
        $scope.divHeightStyle.height = 100/6 + 'vw';
      }
      $scope.history = $localStorage.history.map(m => {
        return {
          url: m,
          width: 1,
          height: 1,
          style: { width: '100%', overflow: 'hidden'},
        };
      });
      $scope.history.forEach((f, i) => {
        const img = new Image();
        // $scope.$apply(() => {
          img.onload = () => {
            $scope.history[i].width = img.width;
            $scope.history[i].height = img.height;
          };
        // });
        img.src = f.url;
      });
      // console.log($scope.history);
      $scope.$watch('history', () => {
        $scope.history.forEach((f, i) => {
          if(f.height < f.width) {
            f.style = { height: '100% ', overflow: 'visible', 'max-width': '200%'};
          }
        });
        console.log($scope.history);
      }, true);

      $scope.toImage = (index) => {
        $scope.setHistoryIndex(true);
        $scope.setIndex(index);
        $state.go('index');
      };
    }
  ])
;
