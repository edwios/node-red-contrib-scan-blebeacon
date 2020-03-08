module.exports = function(RED) {

    "use strict";
    const BeaconScanner = require('./scanner.js');
    const scanner = new BeaconScanner();

    function BLEBeaconNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var timeoutId = 0;
        var delay = parseFloat(config.delay);

        scanner.onadvertisement = (ad) => {
	    if(ad !== null)
	    {
                node.send({
                   payload: ad
                });
	    }
        };

        node.on('input', function(msg) {
            clearTimeout(timeoutId);
            scanner.startScan().then(() => {
                node.status({
                    fill: "green",
                    shape: "dot",
                    text: "Scanning Started"
                });
            }).catch((error) => {
                node.status({
                    fill: "red",
                    shape: "dot",
                    text: error
                });
            });
            timeoutId = setTimeout(function() {
                clearTimeout(timeoutId);
                timeoutId = 0;
                scanner.stopScan();
                node.status({fill:"red",shape:"dot",text:"Scan Stopped"});
            }, delay);
         });

        node.on('close', function(done) {
            scanner.stopScan();
            clearTimeout(timeoutId);
            timeoutId = 0;
            node.status({});
            done();
        });
        
    }
    RED.nodes.registerType("Scan BLE Beacons",BLEBeaconNode);
}



