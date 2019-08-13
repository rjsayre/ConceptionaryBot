var map={};
var sender=123;
var test2=[5,3,11];
var test3=[1,2,3,4,5];
var test1=[5,3,2,1];
var names=["A B", "Bob A", "Bob Z", "Bob D"];
var sortedNames=names.sort(function(a,b){
	var splitA = a.split(" ");
    var splitB = b.split(" ");
    var lastA = splitA[splitA.length - 1];
    var lastB = splitB[splitB.length - 1];

    if (lastA < lastB) return -1;
    if (lastA > lastB) return 1;
    return 0;
});
console.log(sortedNames);
var check = true
for(var i in test2){
	if(test3.indexOf(test2[i])===-1){
		check=false;
		break;
	}
	if(!check){
		break
	}
	else{
		check=true;
	}
}
if(check){
	console.log("test passed");
}
else{
	console.log("second test passed");
}
map[sender]="helo";
var arr="against";
var arr2="against,for";
console.log(arr.split(","));
if(arr.indexOf("against")>-1){
	console.log("hurrah");
}
if(map[434]==undefined){
	console.log("assumption wins");
}
if(434>=433){
	console.log("assumption2 wins");
}
console.log(map[sender]);