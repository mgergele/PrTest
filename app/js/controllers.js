'use strict';

/* helper function */
function getHour(timeString) {    
    if (timeString == '') return null;

    var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i); 
    if (time == null) return null;

    var hours = parseInt(time[1],10);    
    var minutes = parseInt(time[3],10) || 0;
    return hours + minutes/60;
}

function StdPreis(){
    this.dat = {};
}

StdPreis.prototype.set = function(key, val){
    this.dat[key] = val;
}

StdPreis.fillGaps = function(keylist){
    // test
    for(var key in keylist){
        if (! key in this.dat){
            this.dat[key] = '/';
        }
    }
}

function AbschnittCache(){
    this.cache = {};
    this.length = 0;
}
AbschnittCache.prototype.getKey = function(von, bis){
    return  von + '/' + bis;
}
AbschnittCache.prototype.convert = function(von, bis){
    var key = this.getKey(von, bis);
    if(this.cache[key]){
        return this.cache[key];
    }
    var abLength = getHour(bis) - getHour(von);
    if(abLength < 0){
        abLength += 24;
    }

    var a = {};

    if(abLength > 0){
        a['von'] = von;
        a['bis'] = bis;
        a['name'] = von.substr(0,2) + ' - ' + bis.substr(0,2);
        a['length'] = abLength;
        a['key'] = key;
        this.cache[key] = a;
        this.length++;

        return a;
    }
    return null;
}
AbschnittCache.prototype.reset = function(){
    this.cache = {};
    this.length=0;
}

/* Controllers */

function AuswahlCtrl() {}
AuswahlCtrl.$inject = [];

function TgrCtrl($scope){
    $scope.tarifgruppe_id = null;
    $scope.tarifgruppe_name = null;
    $scope.tarifgruppe_sel = false;
}

function DetailCtrl($scope) {

    $scope.abschnitte = new AbschnittCache();
    $scope.preise = [];
    $scope.tarifgruppen = [];


    $scope.lade = function(){

        $scope.abschnitte.reset();
        $scope.preise = [];
        $scope.tarifgruppen = [];


        for(var i=0; i<$scope.tarife.length;i++){
            var t = $scope.tarife[i];
            var stunden = 0;
            var preis = new StdPreis();
            if(! t.tarif_id in $scope.tarifgruppen){
                tgr = {tarifgruppe_id : t.tarif_id, tarifgruppe_name : t.tarif_name, tarifgruppe_sel : false};
                $scope.tarifgruppen.push(tgr);
            }

            for(var j=0; j<4; j++){
                if(stunden > 23.9){
                    break;
                }
                var limCurrent = t['std_lim' + j + '_tm'];
                var limNext = t['std_lim' + (j+1) + '_tm'];

                var dat = $scope.abschnitte.convert(limCurrent, limNext);
                var abLength = dat['length'];
                if(abLength < 0){
                    abLength += 24;
                }
                stunden += abLength;
                preis.set(dat['key'],t['std_' + (i+1)]);
            }
            $scope.preise[t['id']] = preis;
        }
    }

    $scope.readPreis = function(i, ab){

        var preis = [];
        t= $scope.tarife[i];
        var preisIndexKey = 'abs:' + ab['key'];
        if(i == 0){
            alert('check from ' + preisIndexKey + ' as ' + t[preisIndexKey] + ' vs ' + ab['von'] + ' - ' + ab['bis']);
        }
        if(preisIndexKey in t){
            if(i == 0){
                alert('release from ' + preisIndexKey + ' as ' + t[preisIndexKey]);
            }
            return t['std_' + t[preisIndexKey]];
        }
        else{
            return '/';
        }
    };

    $scope.$watch('tarife', $scope.lade);

    $scope.addPreis = function(i,j,add){
        $scope.preise[i][j] = Number($scope.preise[i][j]) + Number(add);
    };

}
DetailCtrl.$inject = ['$scope'];

function TarifCtrl($scope, $http){
    $scope.heads=[];
    $scope.tarife=[];

    $http.get('data/getData.php').success(function(data) {
        $scope.tarife = data;
        $scope.ladeTarife();
    });
    
    $scope.ladeTarife = function(){
        $scope.heads=[];
        for(var i in $scope.tarife[0]){
            $scope.heads.push(i);
        }
    }
}
DetailCtrl.$inject = ['$scope', '$http'];
