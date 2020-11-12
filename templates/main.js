function getCommand(name, componentId, parameters){
    var command = {
        '@class': 'com.adstter.tecun.services.integration.Command', 
        'name': name,
        'componentId' : componentId,
        'parameters': parameters
    };
    return command;
};