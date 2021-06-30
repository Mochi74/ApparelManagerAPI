'use strict';

const express = require('express');
const ApparelManager = express();
const port = 3000;

var registry; 
var iothub = require('azure-iothub');
var connectionString = process.env.IOTHUB_CONNECTION_STRING;


ApparelManager.listen(port, () => {
    console.log(`Apparel manager app listening on port ${port}!`);
    registry = iothub.Registry.fromConnectionString(connectionString);
    console.log(`Apparel manager connected to IoT hub!`);
});



ApparelManager.get('/apparel/:apparelId/client', (req, res) => {
    const apparelId= req.params.apparelId;

    registry.get(apparelId, function (err,device,_connect) {
        if(err!=null) {
            console.error('Apparel '+ apparelId +' do not exist ');;
            res.json('device not found',409);
        }
        else {
            registry.getTwin(device.deviceId,function(err,twin) {
                if(twin.properties.desired.client==undefined){
                    res.json("no client assigned",520);
                }
                res.json('{apparel:'+device.deviceId+',client:' + twin.deviceIdtwin.properties.desired.client+ '}',200);
                 
            })
        }
        
    });

}); 


ApparelManager.post('/apparel/:apparelId/client/:clientId', (req, res) => {
// post create apparel and tag apparel twin with client
    const apparelId= req.params.apparelId;
    const clientId= req.params.clientId;

     // check if device already exist
     registry.get(apparelId, function (err,device,_connect) {
        if(err==null) {
            console.error('Apparel '+ apparelId +' already exist ');;
            res.json('apparel already exist',409);
            }
        else {
            var device = {
                deviceId: apparelId,
                status: 'enabled'
                };

            registry.create(device, function (err) {
                if(err) {
                    console.error('Could not create device: ' + err.message);
                    res.json('can\'t create device : '+ err.message, 520);
                    }
                else {
                    registry.get(device.deviceId, function(err, deviceInfo) {
                        if(err) {
                            console.error('Could not get device: ' + err.message);
                            res.json('Could not get device: ' + err.message, 520);
                            
                            }    
                        else {
                            // get twin    
                            registry.getTwin(deviceInfo.deviceId, function(err, twin){
                                if (err) {
                                    console.error(err.constructor.name + ': ' + err.message);
                                    res.json('Could not get device twin: ' + err.message, 520);
                                } else {
                                    var patch = {
                                        tags: {
                                            client: clientId
                                        },
                                        properties: {
                                            desired : {
                                                client : clientId
                                            }
                                        }
                                    };
                            
                                    twin.update(patch, function(err) {
                                        if (err) {
                                            console.error('Could not update twin: ' + err.constructor.name + ': ' + err.message);
                                            res.json('Could not update twin: ' + err.constructor.name + ': ' + err.message, 520);
                                        } else {
                                            console.log(twin.deviceId + ' twin created and Tagged to ' + clientId+ ' successfully');
                                            res.json('{apparel:'+twin.deviceId + ',client:' + clientId+ '}', 200);
                                        }
                                    });
                                }
                            });                                                
                        }
                    });    
                };
            });
        }    
    });
});




ApparelManager.put('/apparel/:apparelId/client/:clientId', (req, res) => {
    const apparelId= req.params.apparelId;
    const clientId= req.params.clientId;

    // check if device  exist
    registry.get(apparelId, function (err,device,_connect) {
       if(err!=null) {
            console.error('Apparel '+ apparelId +' do not exist ');;
            res.json('Apparel '+ apparelId +'do not exist ',409);
            }
       else {       
            // get twin    
            registry.getTwin(device.deviceId, function(err, twin){
                if (err) {
                    console.error(err.constructor.name + ': ' + err.message);
                    res.json('Could not get device twin: ' + err.message, 520);
                } else {
                    // patch twin
                    var patch = {
                        tags: {
                            client: clientId
                        },
                        properties: {
                            desired : {
                                client : clientId
                            }
                        }
                    };
            
                    twin.update(patch, function(err) {
                        if (err) {
                            console.error('Could not update twin: ' + err.constructor.name + ': ' + err.message);
                            res.json('Could not update twin: ' + err.constructor.name + ': ' + err.message, 520);
                        } else {
                            console.log(twin.deviceId + ' twin updated to ' + clientId+ ' successfully');
                            res.json('{apparel:'+twin.deviceId + ',client:' + clientId+ '}', 200);
                        }
                    });
                }
           });                                                
        }            
    });   
});

ApparelManager.delete('/apparel/:apparelId', (req, res) => {
    const apparelId= req.params.apparelId;
    
    // check if device  exist
    registry.get(apparelId, function (err,device,_connect) {
       if(err!=null) {
            console.error('Apparel '+ apparelId +' do not exist ');;
            res.json('Apparel '+ apparelId +'do not exist ',409);
            }
       else {       
            // delete apparel     
            registry.delete(device.deviceId, function(err){
                if (err) {
                    console.error(err.constructor.name + ': ' + err.message);
                    res.json('Could not get device twin: ' + err.message, 520);
                } else {
                    console.log(apparelId + ' deleted ');
                    res.json('{}', 200);
                }
           });                                                
        }            
    });   
});
