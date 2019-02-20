function onlyName(role) {
    return {name: role.name}
}

function toNameList(roles) {
    return roles.map(r => r.name)
}

module.exports = {
    onlyName, toNameList
};