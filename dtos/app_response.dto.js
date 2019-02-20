
exports.builSimpleSuccess = () => {
    return {success: true}
};


exports.buildSuccessWithMessages = (messages) => {
    let response = {success: true};
    if (typeof messages === "string")
        response.full_messages = [messages];
    else if (messages instanceof Array)
        response.full_messages = messages;
    else if (messages instanceof Object)
        response.full_messages = Object.values(messages);

    return response;
};

exports.buildWithErrorMessages = (messages) => {
    let response = {success: false};
    if (typeof messages === "string")
        response.full_messages = [messages];
    else if (messages instanceof Array)
        response.full_messages = messages;
    else if (messages instanceof Object) {
        response.errors = messages;
        response.full_messages = Object.values(messages);
    }
    return response;
};


exports.builSimpleSuccess = () => {
    return {success: true}
};