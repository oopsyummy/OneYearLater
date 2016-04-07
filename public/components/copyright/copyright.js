angular.module('copyright',[])
.directive('copyright',function(){
  return {
    restrict:"E",
    replace:true,
    templateUrl:"components/copyright/copyright.html",
    css:"components/copyright/copyright.css",
    link:function(scope,element,attr){

    }
  }
})
