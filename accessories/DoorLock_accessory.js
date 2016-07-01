var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

// Generate a consistent UUID for our Lock Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "lock".
var UUID = uuid.generate('colemancda:accessories:lock');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var lock = exports.accessory = new Accessory('Cerradura', UUID);

var state = false;

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
lock.username = "C1:5D:3A:EE:5E:FA";
lock.pincode = "569-99-325";

// set some basic properties (these values are arbitrary and setting them is optional)
lock
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "ColemanCDA")
  .setCharacteristic(Characteristic.Model, "CerraduraOne");

// listen for the "identify" event for this Accessory
lock.on('identify', function(paired, callback) {
  console.log("Lock identified");
});

// Add the actual Door Lock Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
lock
  .addService(Service.Door, "Cerradura") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.TargetPosition)
  .on('set', function(value, callback) {

    if (value != 100) {

      lock
        .getService(Service.Door)
        .setCharacteristic(Characteristic.CurrentPosition, value);

      callback();

      return;
    }
    
    console.log("Open Door");

    callback();

      lock
        .getService(Service.Door)
        .setCharacteristic(Characteristic.CurrentPosition, 100);
  });

  // We want to intercept requests for our current state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
lock
  .getService(Service.Door)
  .getCharacteristic(Characteristic.CurrentPosition)
  .on('get', function(callback) {

    console.log("Current Position");

    callback(null, 0);
  });
